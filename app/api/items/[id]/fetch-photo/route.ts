import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchProductImage } from '@/lib/fetch-image'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: item, error: fetchError } = await supabaseAdmin
    .from('items')
    .select('name, brand, color, product_url, image_url')
    .eq('id', id)
    .single()

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  const searchQuery = [item.brand, item.name, item.color].filter(Boolean).join(' ')
  const image_url = await fetchProductImage(item.product_url, searchQuery)

  if (!image_url) {
    return NextResponse.json({ error: 'Could not find a photo' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('items')
    .update({ image_url })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ image_url })
}
