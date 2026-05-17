import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { condition } = await req.json().catch(() => ({}))

  const { data: item, error } = await supabaseAdmin
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  const details = [
    `Name: ${item.name}`,
    item.brand && `Brand: ${item.brand}`,
    item.category && `Category: ${item.category}`,
    item.color && `Color: ${item.color}`,
    item.size && `Size: ${item.size}`,
    item.gender && `Gender: ${item.gender}`,
    item.purchase_price && `Original purchase price: $${item.purchase_price}`,
    item.notes && `Notes: ${item.notes}`,
  ]
    .filter(Boolean)
    .join('\n')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userContent: any[] = []

  if (item.image_url) {
    userContent.push({
      type: 'image',
      source: { type: 'url', url: item.image_url },
    })
  }

  userContent.push({
    type: 'text',
    text: `Generate an eBay listing for this clothing item based on the details below${item.image_url ? ' and the photo' : ''}.

${details}
${condition ? `eBay condition (already selected by seller): ${condition}` : ''}

Return ONLY a JSON object with these fields:
- title: string (max 80 chars, keyword-rich eBay title, no special characters like !, *, $)
- suggested_price: number (realistic resale price in USD based on condition — new items 60-80% of retail, pre-owned 20-50%)
- description: string (plain text, 3-4 paragraphs; include all known details, reference the condition "${condition || 'as described'}", size info, mention smoke-free home)`,
  })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userContent }],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
  }

  try {
    const raw = textContent.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
    const listing = JSON.parse(raw)
    return NextResponse.json(listing)
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse AI response', raw: textContent.text },
      { status: 500 }
    )
  }
}
