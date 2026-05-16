import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: Request) {
  const { ids, updates } = await req.json()
  if (!ids?.length) return NextResponse.json({ error: 'No items selected' }, { status: 400 })
  if (!updates || Object.keys(updates).length === 0)
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, count: ids.length })
}
