import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { headers } from 'next/headers'

function getOrigin(req: Request): string {
  // Use forwarded headers when behind a reverse proxy
  const headersList = headers()
  const forwardedProto = headersList.get('x-forwarded-proto')
  const forwardedHost = headersList.get('x-forwarded-host')

  if (forwardedProto && forwardedHost) {
    // x-forwarded-proto can be a comma-separated list; take the first
    const proto = forwardedProto.split(',')[0].trim()
    return `${proto}://${forwardedHost}`
  }

  // Fall back to the request URL origin
  return new URL(req.url).origin
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Google OAuth credentials not configured' },
      { status: 500 }
    )
  }

  const origin = getOrigin(req)
  const redirectUri = `${origin}/api/calendar/callback`

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent',
  })

  return NextResponse.redirect(authUrl)
}
