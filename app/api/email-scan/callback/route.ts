import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractTextFromHtml(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  // Replace block-level elements with newlines
  text = text.replace(/<(br|p|div|tr|li)[^>]*>/gi, '\n')
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, '')
  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&quot;/g, '"')
  // Collapse whitespace
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n+/g, '\n\n')
  return text.trim()
}

type MailPart = {
  mimeType?: string
  body?: { data?: string }
  parts?: MailPart[]
}

function getEmailBody(payload: MailPart, depth = 0): string {
  if (!payload || depth > 8) return ''

  if (payload.mimeType === 'text/html' && payload.body?.data) {
    const html = Buffer.from(payload.body.data, 'base64url').toString('utf-8')
    return extractTextFromHtml(html)
  }

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8')
  }

  if (payload.parts) {
    // Prefer HTML for receipts (richer content)
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = Buffer.from(part.body.data, 'base64url').toString('utf-8')
        return extractTextFromHtml(html)
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64url').toString('utf-8')
      }
    }
    // Recurse into nested multipart
    for (const part of payload.parts) {
      const text = getEmailBody(part, depth + 1)
      if (text) return text
    }
  }

  return ''
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/email-scan?error=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/email-scan?error=no_code`
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/email-scan/callback'
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Search using Gmail's Purchases label first, then fall back to keyword search
    const [purchasesResp, keywordResp] = await Promise.all([
      gmail.users.messages.list({
        userId: 'me',
        q: 'label:purchases newer_than:10y',
        maxResults: 100,
      }),
      gmail.users.messages.list({
        userId: 'me',
        q: 'subject:(order OR receipt OR "order confirmation" OR "shipping confirmation") newer_than:10y',
        maxResults: 100,
      }),
    ])

    // Deduplicate by message ID
    const seen = new Set<string>()
    const allMessages = [...(purchasesResp.data.messages || []), ...(keywordResp.data.messages || [])]
    const messages = allMessages.filter(m => {
      if (!m.id || seen.has(m.id)) return false
      seen.add(m.id)
      return true
    }).slice(0, 60)

    console.log(`[email-scan] purchases label: ${purchasesResp.data.messages?.length ?? 0}, keyword search: ${keywordResp.data.messages?.length ?? 0}, total unique: ${messages.length}`)

    const foundItems: Record<string, string | number | undefined>[] = []

    // Process emails in batches of 5
    for (let i = 0; i < messages.length; i += 5) {
      const batch = messages.slice(i, i + 5)
      await Promise.all(
        batch.map(async (msg) => {
          if (!msg.id) return
          try {
            const msgData = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id,
              format: 'full',
            })

            const payload = msgData.data.payload
            if (!payload) return

            const subject = msgData.data.payload?.headers?.find(h => h.name === 'Subject')?.value ?? '(no subject)'
            const body = getEmailBody(payload as Parameters<typeof getEmailBody>[0])
            console.log(`[email-scan] "${subject}" — body length: ${body.length}`)

            if (!body || body.length < 50) return

            // Truncate to avoid token limits
            const truncatedBody = body.slice(0, 6000)

            const response = await anthropic.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 1024,
              system:
                'You are a receipt parser. Extract clothing/fashion items from this order email. ' +
                'Return a JSON array of items. Each item: { name, brand, color, size, purchase_price, purchase_date, product_url, category }. ' +
                'Only include actual clothing/shoe/accessory items. Return [] if none found. Return ONLY valid JSON, no markdown.',
              messages: [{ role: 'user', content: truncatedBody }],
            })

            const textContent = response.content.find((c) => c.type === 'text')
            if (!textContent || textContent.type !== 'text') return

            console.log(`[email-scan] Claude response for "${subject}": ${textContent.text.slice(0, 200)}`)

            try {
              const raw = textContent.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log(`[email-scan] Found ${parsed.length} items in "${subject}"`)
                parsed.forEach((item: Record<string, string | number | undefined>) => {
                  foundItems.push({ ...item, gmail_message_id: msg.id ?? undefined })
                })
              }
            } catch {
              console.log(`[email-scan] JSON parse failed for "${subject}"`)
            }
          } catch (e) {
            console.log(`[email-scan] Error processing message ${msg.id}:`, e)
          }
        })
      )
    }

    console.log(`[email-scan] Total items found: ${foundItems.length}`)

    // Encode items as base64 and redirect to review page
    const encoded = Buffer.from(JSON.stringify(foundItems)).toString('base64url')
    return NextResponse.redirect(
      `http://localhost:3000/email-scan?items=${encoded}`
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.redirect(
      `http://localhost:3000/email-scan?error=${encodeURIComponent(msg)}`
    )
  }
}
