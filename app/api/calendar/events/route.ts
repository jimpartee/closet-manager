import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const now = new Date().toISOString()
  const sixtyDaysOut = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .select(`
      *,
      calendar_account:calendar_accounts(id, email),
      event_bags(
        id,
        bag_id,
        notes,
        created_at,
        bag:bags(id, name, description)
      ),
      event_outfits(
        id,
        outfit_id,
        created_at,
        outfit:saved_outfits(id, name, description)
      )
    `)
    .gte('start_time', now)
    .lte('start_time', sixtyDaysOut)
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
