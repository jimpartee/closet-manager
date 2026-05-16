import { supabaseAdmin } from '@/lib/supabase'
import { fetchProductImage } from '@/lib/fetch-image'

export async function POST() {
  const { data: items, error } = await supabaseAdmin
    .from('items')
    .select('id, name, brand, color, product_url')
    .is('image_url', null)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const missing = items ?? []

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'))

      send({ total: missing.length, filled: 0, current: null })

      let filled = 0
      for (const item of missing) {
        const searchQuery = [item.brand, item.name, item.color].filter(Boolean).join(' ')
        send({ total: missing.length, filled, current: item.name })

        const image_url = await fetchProductImage(item.product_url, searchQuery)

        if (image_url) {
          await supabaseAdmin.from('items').update({ image_url }).eq('id', item.id)
          filled++
        }
      }

      send({ total: missing.length, filled, current: null, done: true })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Accel-Buffering': 'no' },
  })
}
