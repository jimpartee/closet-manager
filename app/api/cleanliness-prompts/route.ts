import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Returns items from events that ended in the past 7 days that are still marked clean
export async function GET() {
  const now = new Date().toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: events, error } = await supabaseAdmin
    .from('calendar_events')
    .select(`
      id,
      title,
      end_time,
      event_outfits(
        outfit_id,
        outfit:saved_outfits(
          id,
          name,
          outfit_items(
            item_id,
            item:items(id, name, brand, image_url, category, cleanliness, location_id)
          )
        )
      )
    `)
    .lt('end_time', now)
    .gte('end_time', sevenDaysAgo)
    .not('event_outfits', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Prompt = {
    item: Record<string, unknown>
    event_id: string
    event_title: string
    event_end_time: string
    outfit_name: string
  }

  const prompts: Prompt[] = []
  const seen = new Set<string>()

  for (const event of events ?? []) {
    for (const eo of (event.event_outfits as Record<string, unknown>[] ?? [])) {
      const outfit = eo.outfit as Record<string, unknown> | null
      if (!outfit) continue
      const outfitName = outfit.name as string
      for (const oi of (outfit.outfit_items as Record<string, unknown>[] ?? [])) {
        const item = oi.item as Record<string, unknown> | null
        if (!item) continue
        if (item.cleanliness !== 'clean') continue
        const key = `${item.id}:${event.id}`
        if (seen.has(key)) continue
        seen.add(key)
        prompts.push({
          item,
          event_id: event.id,
          event_title: event.title ?? '(No title)',
          event_end_time: event.end_time ?? '',
          outfit_name: outfitName,
        })
      }
    }
  }

  return NextResponse.json(prompts)
}
