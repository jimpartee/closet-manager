import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(req: Request) {
  const headersList = headers()
  const forwardedProto = headersList.get('x-forwarded-proto')
  const forwardedHost = headersList.get('x-forwarded-host')

  let origin = new URL(req.url).origin
  if (forwardedProto && forwardedHost) {
    const proto = forwardedProto.split(',')[0].trim()
    origin = `${proto}://${forwardedHost}`
  }

  return NextResponse.json({
    redirect_uri: `${origin}/api/calendar/callback`,
    origin,
    req_url_origin: new URL(req.url).origin,
    x_forwarded_proto: forwardedProto,
    x_forwarded_host: forwardedHost,
    host: headersList.get('host'),
  })
}
