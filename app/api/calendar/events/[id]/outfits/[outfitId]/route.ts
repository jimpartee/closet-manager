import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; outfitId: string }> }
) {
  const { id: calendar_event_id, outfitId: outfit_id } = await params
  const { error } = await supabaseAdmin
    .from('event_outfits')
    .delete()
    .eq('calendar_event_id', calendar_event_id)
    .eq('outfit_id', outfit_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
