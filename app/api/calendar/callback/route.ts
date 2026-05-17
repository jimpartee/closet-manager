import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { BASE_URL } from '@/lib/base-url'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${BASE_URL}/calendar?error=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/calendar?error=no_code`)
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    BASE_URL + '/api/calendar/callback'
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get account email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    const email = userInfo.data.email

    if (!email) {
      return NextResponse.redirect(`${BASE_URL}/calendar?error=no_email`)
    }

    // Upsert calendar account (replace if same email already connected)
    const { data: account, error: upsertError } = await supabaseAdmin
      .from('calendar_accounts')
      .upsert(
        {
          email,
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token ?? null,
          token_expiry: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (upsertError || !account) {
      return NextResponse.redirect(
        `${BASE_URL}/calendar?error=${encodeURIComponent(upsertError?.message ?? 'db_error')}`
      )
    }

    // Sync upcoming events for this account
    await syncEventsForAccount(oauth2Client, account.id)

    return NextResponse.redirect(`${BASE_URL}/calendar?connected=1`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.redirect(
      `${BASE_URL}/calendar?error=${encodeURIComponent(msg)}`
    )
  }
}

export async function syncEventsForAccount(
  auth: InstanceType<typeof google.auth.OAuth2>,
  accountId: string
) {
  const calendar = google.calendar({ version: 'v3', auth })

  const now = new Date()
  const sixtyDaysOut = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  const calListResp = await calendar.calendarList.list({ maxResults: 20 })
  const calendars = calListResp.data.items ?? []

  for (const cal of calendars) {
    if (!cal.id) continue
    // Skip spam/holiday calendars that aren't primary or selected
    if (!cal.selected && cal.accessRole !== 'owner') continue

    try {
      const eventsResp = await calendar.events.list({
        calendarId: cal.id,
        timeMin: now.toISOString(),
        timeMax: sixtyDaysOut.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 200,
      })

      const events = eventsResp.data.items ?? []

      for (const event of events) {
        if (!event.id) continue

        const isAllDay = !event.start?.dateTime
        const startTime = event.start?.dateTime ?? event.start?.date
        if (!startTime) continue

        await supabaseAdmin.from('calendar_events').upsert(
          {
            calendar_account_id: accountId,
            google_event_id: event.id,
            title: event.summary ?? null,
            description: event.description ?? null,
            start_time: new Date(startTime).toISOString(),
            end_time: event.end?.dateTime
              ? new Date(event.end.dateTime).toISOString()
              : event.end?.date
              ? new Date(event.end.date).toISOString()
              : null,
            location: event.location ?? null,
            calendar_id: cal.id,
            is_all_day: isAllDay,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'calendar_account_id,google_event_id' }
        )
      }
    } catch {
      // Skip calendars we can't read
    }
  }
}
