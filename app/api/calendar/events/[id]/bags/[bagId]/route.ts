import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; bagId: string }> }
) {
  const { id: calendar_event_id, bagId: bag_id } = await params

  const { error } = await supabaseAdmin
    .from('event_bags')
    .delete()
    .eq('calendar_event_id', calendar_event_id)
    .eq('bag_id', bag_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
