import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Returns the Laundry Hamper location id, creating it if needed
export async function GET() {
  const { data: existing } = await supabaseAdmin
    .from('locations')
    .select('id')
    .eq('name', 'Laundry Hamper')
    .maybeSingle()

  if (existing) return NextResponse.json(existing)

  const { data, error } = await supabaseAdmin
    .from('locations')
    .insert({ name: 'Laundry Hamper', type: 'room', description: 'Items waiting to be washed' })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
