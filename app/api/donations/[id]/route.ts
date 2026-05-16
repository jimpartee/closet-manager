import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('*, donation_items(*, item:items(*))')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Get item ids first so we can un-donate them
  const { data: donationItems } = await supabaseAdmin
    .from('donation_items')
    .select('item_id')
    .eq('donation_id', id)

  const { error } = await supabaseAdmin.from('donations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Restore items to active
  if (donationItems && donationItems.length > 0) {
    const itemIds = donationItems.map((di) => di.item_id)
    await supabaseAdmin
      .from('items')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .in('id', itemIds)
  }

  return NextResponse.json({ success: true })
}
