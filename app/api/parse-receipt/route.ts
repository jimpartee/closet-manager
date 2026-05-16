import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { fetchProductImage } from '@/lib/fetch-image'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system:
      'You are a receipt parser. Extract clothing/fashion items from this receipt or order document. ' +
      'Return a JSON array of items. Each item: { name, brand, color, size, purchase_price, purchase_date, product_url, category }. ' +
      'Only include actual clothing/shoe/accessory items. Return [] if none found. Return ONLY valid JSON, no markdown.',
    messages: [
      {
        role: 'user',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          { type: 'text', text: 'Extract all clothing, shoe, and accessory items from this receipt.' },
        ] as any,
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return NextResponse.json({ items: [] })
  }

  console.log('[parse-receipt] Claude raw response:', textContent.text)

  try {
    let raw = textContent.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const arrayMatch = raw.match(/\[[\s\S]*\]/)
    if (arrayMatch) raw = arrayMatch[0]
    const items = JSON.parse(raw)
    if (!Array.isArray(items)) return NextResponse.json({ items: [] })

    // Fetch product images in parallel (cap at 10 concurrent)
    const withImages = await Promise.all(
      items.map(async (item: Record<string, string | number | null>) => {
        const searchQuery = [item.brand, item.name, item.color].filter(Boolean).join(' ')
        const image_url = await fetchProductImage(
          typeof item.product_url === 'string' ? item.product_url : null,
          String(searchQuery)
        )
        return image_url ? { ...item, image_url } : item
      })
    )

    return NextResponse.json({ items: withImages })
  } catch {
    console.log('[parse-receipt] JSON parse failed, raw:', textContent.text)
    return NextResponse.json({ error: 'Failed to parse response', raw: textContent.text }, { status: 500 })
  }
}
