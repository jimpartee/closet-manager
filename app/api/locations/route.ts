import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const [locationsResult, bagsResult] = await Promise.all([
    supabaseAdmin.from('locations').select('*').order('name'),
    supabaseAdmin.from('bags').select('*, location:locations(*)').order('name'),
  ])

  if (locationsResult.error)
    return NextResponse.json({ error: locationsResult.error.message }, { status: 500 })
  if (bagsResult.error)
    return NextResponse.json({ error: bagsResult.error.message }, { status: 500 })

  return NextResponse.json({
    locations: locationsResult.data,
    bags: bagsResult.data,
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('locations')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
