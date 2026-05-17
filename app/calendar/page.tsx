import { CalendarClient } from './calendar-client'

export default function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  return <CalendarPageInner searchParamsPromise={searchParams} />
}

async function CalendarPageInner({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ connected?: string; error?: string }>
}) {
  const searchParams = await searchParamsPromise
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your Google Calendar and assign bags to upcoming events
        </p>
      </div>
      <CalendarClient
        connected={searchParams.connected === '1'}
        error={searchParams.error}
      />
    </div>
  )
}
