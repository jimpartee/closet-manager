import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { headers } from 'next/headers'

async function getOrigin(req: Request): Promise<string> {
  const headersList = await headers()
  const forwardedProto = headersList.get('x-forwarded-proto')
  const forwardedHost = headersList.get('x-forwarded-host')
  if (forwardedProto && forwardedHost) {
    const proto = forwardedProto.split(',')[0].trim()
    return `${proto}://${forwardedHost}`
  }
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

  const origin = await getOrigin(req)
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
