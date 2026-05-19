import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: outfit_id } = await params
  const { item_id } = await req.json()
  if (!item_id) return NextResponse.json({ error: 'item_id required' }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from('outfit_items')
    .select('id')
    .eq('outfit_id', outfit_id)
    .eq('item_id', item_id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Item already in outfit' }, { status: 409 })

  const { data, error } = await supabaseAdmin
    .from('outfit_items')
    .insert({ outfit_id, item_id })
    .select('id, item_id, item:items(id, name, brand, image_url, category, cleanliness)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
