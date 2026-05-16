import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('*, donation_items(*, item:items(*))')
    .order('donation_date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { organization, donation_date, notes, receipt_image_url, items } = body

  // Calculate total estimated value
  const total_estimated_value = items?.reduce(
    (sum: number, i: { estimated_value?: number }) => sum + (i.estimated_value || 0),
    0
  ) || 0

  // Create donation record
  const { data: donation, error: donationError } = await supabaseAdmin
    .from('donations')
    .insert({ organization, donation_date, notes, receipt_image_url, total_estimated_value })
    .select()
    .single()

  if (donationError)
    return NextResponse.json({ error: donationError.message }, { status: 500 })

  // Create donation_items records
  if (items && items.length > 0) {
    const donationItems = items.map((i: { item_id: string; estimated_value?: number }) => ({
      donation_id: donation.id,
      item_id: i.item_id,
      estimated_value: i.estimated_value,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('donation_items')
      .insert(donationItems)

    if (itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })

    // Mark items as donated
    const itemIds = items.map((i: { item_id: string }) => i.item_id)
    await supabaseAdmin
      .from('items')
      .update({ status: 'donated', updated_at: new Date().toISOString() })
      .in('id', itemIds)
  }

  // Return donation with items
  const { data: fullDonation, error: fetchError } = await supabaseAdmin
    .from('donations')
    .select('*, donation_items(*, item:items(*))')
    .eq('id', donation.id)
    .single()

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })

  return NextResponse.json(fullDonation)
}
