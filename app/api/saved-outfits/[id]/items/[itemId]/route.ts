import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: outfit_id, itemId: item_id } = await params
  const { error } = await supabaseAdmin
    .from('outfit_items')
    .delete()
    .eq('outfit_id', outfit_id)
    .eq('item_id', item_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
