import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: calendar_event_id } = await params
  const body = await req.json()
  const { bag_id, notes } = body

  if (!bag_id) {
    return NextResponse.json({ error: 'bag_id required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('event_bags')
    .insert({ calendar_event_id, bag_id, notes: notes ?? null })
    .select('*, bag:bags(id, name, description)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
