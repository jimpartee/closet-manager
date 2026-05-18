import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

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
  const origin = await getOrigin(req)
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${origin}/calendar?error=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/calendar?error=no_code`)
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${origin}/api/calendar/callback`
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get account email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    const email = userInfo.data.email

    if (!email) {
      return NextResponse.redirect(`${origin}/calendar?error=no_email`)
    }

    // Save or update the calendar account
    const { data: existing } = await supabaseAdmin
      .from('calendar_accounts')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    let accountId: string
    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from('calendar_accounts')
        .update({
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token ?? null,
          token_expiry: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
        })
        .eq('id', existing.id)
      if (updateError) {
        return NextResponse.redirect(
          `${origin}/calendar?error=${encodeURIComponent(updateError.message)}`
        )
      }
      accountId = existing.id
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('calendar_accounts')
        .insert({
          email,
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token ?? null,
          token_expiry: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
        })
        .select('id')
        .single()
      if (insertError || !inserted) {
        return NextResponse.redirect(
          `${origin}/calendar?error=${encodeURIComponent(insertError?.message ?? 'db_error')}`
        )
      }
      accountId = inserted.id
    }

    // Sync events — non-fatal, account is saved regardless
    try {
      await syncEventsForAccount(oauth2Client, accountId)
    } catch {
      // Sync failure (e.g. Calendar API not enabled) doesn't block account save
    }

    return NextResponse.redirect(`${origin}/calendar?connected=1`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.redirect(
      `${origin}/calendar?error=${encodeURIComponent(msg)}`
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

        const eventPayload = {
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
        }
        const { data: existingEvent } = await supabaseAdmin
          .from('calendar_events')
          .select('id')
          .eq('calendar_account_id', accountId)
          .eq('google_event_id', event.id)
          .maybeSingle()
        if (existingEvent) {
          await supabaseAdmin
            .from('calendar_events')
            .update(eventPayload)
            .eq('id', existingEvent.id)
        } else {
          await supabaseAdmin.from('calendar_events').insert(eventPayload)
        }
      }
    } catch {
      // Skip calendars we can't read
    }
  }
}
