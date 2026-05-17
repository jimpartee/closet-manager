import { NextResponse } from 'next/server'
import { google, type Auth } from 'googleapis'
import { supabaseAdmin } from '@/lib/supabase'
import { syncEventsForAccount } from '../../callback/route'

export async function POST() {
  const { data: accounts, error } = await supabaseAdmin
    .from('calendar_accounts')
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  let synced = 0
  const errors: string[] = []
  for (const account of accounts) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      )
      oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.token_expiry
          ? new Date(account.token_expiry).getTime()
          : undefined,
      })

      // Auto-refresh token if needed
      oauth2Client.on('tokens', async (tokens: Auth.Credentials) => {
        if (tokens.access_token) {
          await supabaseAdmin
            .from('calendar_accounts')
            .update({
              access_token: tokens.access_token,
              token_expiry: tokens.expiry_date
                ? new Date(tokens.expiry_date).toISOString()
                : null,
            })
            .eq('id', account.id)
        }
      })

      await syncEventsForAccount(oauth2Client, account.id)
      synced++
    } catch (err) {
      errors.push(`${account.email}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (errors.length > 0 && synced === 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }
  return NextResponse.json({ synced, errors })
}
