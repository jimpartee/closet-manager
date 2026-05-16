import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { Item } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { context } = await req.json()

  if (!context) {
    return NextResponse.json({ error: 'context is required' }, { status: 400 })
  }

  // Fetch active items
  const { data: items, error } = await supabaseAdmin
    .from('items')
    .select('id, name, brand, category, color, size')
    .eq('status', 'active')
    .order('category')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No active items in wardrobe' }, { status: 400 })
  }

  // Build wardrobe summary
  const wardrobeSummary = (items as Item[])
    .map(
      (item) =>
        `- ID: ${item.id} | ${item.name}${item.brand ? ` by ${item.brand}` : ''}${item.category ? ` [${item.category}]` : ''}${item.color ? `, ${item.color}` : ''}${item.size ? `, size ${item.size}` : ''}`
    )
    .join('\n')

  const prompt = `You are a personal stylist. Based on this wardrobe, create 3 complete outfit recommendations for: ${context}.

Wardrobe:
${wardrobeSummary}

For each outfit, suggest which owned items to combine. If something is missing, suggest what to buy with estimated price.
Return JSON: { "outfits": [{ "name": string, "occasion": string, "owned_items": [item_ids], "missing_pieces": [{ "description": string, "estimated_price": number, "search_query": string }], "styling_tips": string }] }
Return ONLY valid JSON, no markdown.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
  }

  try {
    const parsed = JSON.parse(textContent.text)

    // Enrich owned_items with item details
    const itemMap = new Map((items as Item[]).map((i) => [i.id, i]))
    const enrichedOutfits = parsed.outfits.map((outfit: {
      name: string
      occasion: string
      owned_items: string[]
      missing_pieces: { description: string; estimated_price: number; search_query: string }[]
      styling_tips: string
    }) => ({
      ...outfit,
      owned_items_details: outfit.owned_items
        .map((id: string) => itemMap.get(id))
        .filter(Boolean),
    }))

    return NextResponse.json({ outfits: enrichedOutfits })
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}
