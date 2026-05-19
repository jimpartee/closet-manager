import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: calendar_event_id } = await params
  const { outfit_id } = await req.json()
  if (!outfit_id) return NextResponse.json({ error: 'outfit_id required' }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from('event_outfits')
    .select('id')
    .eq('calendar_event_id', calendar_event_id)
    .eq('outfit_id', outfit_id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Outfit already assigned' }, { status: 409 })

  const { data, error } = await supabaseAdmin
    .from('event_outfits')
    .insert({ calendar_event_id, outfit_id })
    .select('id, outfit_id, outfit:saved_outfits(id, name, description)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
