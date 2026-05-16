async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; closet-manager/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const html = await res.text()
    if (html.includes('no longer available') || html.includes('404') || html.includes('not found')) return null
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

async function serpImageSearch(query: string): Promise<string | null> {
  const apiKey = process.env.SERP_API_KEY
  if (!apiKey) {
    console.log('[fetch-image] Missing SERP_API_KEY')
    return null
  }

  try {
    const url = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${apiKey}&num=1`
    console.log('[fetch-image] SerpAPI search query:', query)
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    console.log('[fetch-image] SerpAPI response status:', res.status, JSON.stringify(data).slice(0, 200))
    if (!res.ok) return null
    return data.images_results?.[0]?.original ?? null
  } catch (e) {
    console.log('[fetch-image] SerpAPI search error:', e)
    return null
  }
}

export async function fetchProductImage(
  productUrl: string | null | undefined,
  searchQuery: string
): Promise<string | null> {
  // 1. Try og:image from the product page
  if (productUrl) {
    const ogImage = await fetchOgImage(productUrl)
    if (ogImage) return ogImage
  }

  // 2. Fall back to image search
  return serpImageSearch(searchQuery)
}
