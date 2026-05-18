'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, X, RefreshCw, Trash2, LogIn, MapPin, Clock, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import type { CalendarEvent, Bag } from '@/lib/types'

interface CalendarAccount {
  id: string
  email: string
  token_expiry?: string
  created_at: string
}

interface CalendarClientProps {
  connected: boolean
  error?: string
}

export function CalendarClient({ connected, error }: CalendarClientProps) {
  const [accounts, setAccounts] = useState<CalendarAccount[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [bags, setBags] = useState<Bag[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [assigningEventId, setAssigningEventId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [accountsRes, eventsRes, bagsRes] = await Promise.all([
        fetch('/api/calendar/accounts'),
        fetch('/api/calendar/events'),
        fetch('/api/bags'),
      ])
      const [accountsData, eventsData, bagsData] = await Promise.all([
        accountsRes.json(),
        eventsRes.json(),
        bagsRes.json(),
      ])
      if (!accountsRes.ok) toast.error(`Accounts error: ${accountsData?.error ?? accountsRes.status}`)
      if (!eventsRes.ok) toast.error(`Events error: ${eventsData?.error ?? eventsRes.status}`)
      setAccounts(Array.isArray(accountsData) ? accountsData : [])
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setBags(Array.isArray(bagsData) ? bagsData : [])
    } catch {
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (connected) toast.success('Google Calendar connected!')
    if (error) toast.error(`Connection failed: ${error}`)
    loadData()
  }, [connected, error, loadData])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/calendar/events/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.errors?.length) toast.error(`Sync issues: ${data.errors.join('; ')}`)
      else toast.success('Calendar synced')
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async (accountId: string, email: string) => {
    if (!confirm(`Disconnect ${email}? This will remove all synced events.`)) return
    try {
      const res = await fetch(`/api/calendar/accounts/${accountId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to disconnect')
      toast.success(`Disconnected ${email}`)
      await loadData()
    } catch {
      toast.error('Failed to disconnect account')
    }
  }

  const handleAssignBag = async (eventId: string, bagId: string) => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/bags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bag_id: bagId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, event_bags: [...(e.event_bags ?? []), data] }
            : e
        )
      )
      setAssigningEventId(null)
      toast.success('Bag assigned')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign bag')
    }
  }

  const handleRemoveBag = async (eventId: string, bagId: string) => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/bags/${bagId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove bag')
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, event_bags: (e.event_bags ?? []).filter((eb) => eb.bag_id !== bagId) }
            : e
        )
      )
      toast.success('Bag removed')
    } catch {
      toast.error('Failed to remove bag')
    }
  }

  function getDateLabel(dateStr: string) {
    const d = new Date(dateStr)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    if (isThisWeek(d)) return format(d, 'EEEE')
    return format(d, 'MMM d')
  }

  function formatTime(dateStr: string, isAllDay: boolean) {
    if (isAllDay) return 'All day'
    return format(new Date(dateStr), 'h:mm a')
  }

  // Group events by date label
  const grouped: Record<string, CalendarEvent[]> = {}
  for (const event of events) {
    const label = getDateLabel(event.start_time)
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(event)
  }

  const assignedBagIds = (event: CalendarEvent) =>
    new Set((event.event_bags ?? []).map((eb) => eb.bag_id))

  return (
    <div className="space-y-6">
      {/* Connected accounts */}
      <div className="bg-white rounded-2xl border border-pink-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">
            Connected Accounts
          </h2>
          <div className="flex gap-2">
            {accounts.length > 0 && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Sync'}
              </button>
            )}
            <a
              href="/api/calendar/auth"
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition-all shadow-sm shadow-pink-200"
            >
              <LogIn className="h-3.5 w-3.5" />
              Connect Account
            </a>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-2xl bg-pink-50 p-4 mb-3">
              <Calendar className="h-8 w-8 text-pink-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No accounts connected</p>
            <p className="text-xs text-gray-400 mt-1">
              Connect your Google Calendar to see upcoming events
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-xl bg-pink-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                    {account.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{account.email}</span>
                </div>
                <button
                  onClick={() => handleDisconnect(account.id, account.email)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                  title="Disconnect"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events */}
      {accounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest px-1">
            Upcoming Events
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-pink-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
              <p className="text-sm text-gray-400">No upcoming events in the next 60 days</p>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="mt-3 text-xs text-pink-500 hover:text-pink-600 font-medium"
              >
                Sync to check again
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([dateLabel, dayEvents]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-2 px-1">
                  {dateLabel}
                </h3>
                <div className="space-y-2">
                  {dayEvents.map((event) => {
                    const assigned = assignedBagIds(event)
                    const availableBags = bags.filter((b) => !assigned.has(b.id))
                    const isAssigning = assigningEventId === event.id

                    return (
                      <div
                        key={event.id}
                        className="bg-white rounded-2xl border border-pink-100 p-4 hover:border-pink-200 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {event.title ?? '(No title)'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatTime(event.start_time, event.is_all_day)}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[200px]">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  {event.location}
                                </span>
                              )}
                              {event.calendar_account && (
                                <span className="text-xs text-pink-300">
                                  {event.calendar_account.email}
                                </span>
                              )}
                            </div>

                            {/* Assigned bags */}
                            {(event.event_bags ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {(event.event_bags ?? []).map((eb) => (
                                  <span
                                    key={eb.id}
                                    className="flex items-center gap-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium px-2.5 py-0.5"
                                  >
                                    <Briefcase className="h-3 w-3" />
                                    {eb.bag?.name}
                                    <button
                                      onClick={() => handleRemoveBag(event.id, eb.bag_id)}
                                      className="text-pink-400 hover:text-pink-700 ml-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Assign bag button */}
                          {availableBags.length > 0 && (
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={() =>
                                  setAssigningEventId(isAssigning ? null : event.id)
                                }
                                className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-pink-500 bg-pink-50 hover:bg-pink-100 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Bag
                              </button>
                              {isAssigning && (
                                <div className="absolute right-0 top-8 z-10 bg-white rounded-xl shadow-lg border border-pink-100 py-1 min-w-[180px]">
                                  {availableBags.map((bag) => (
                                    <button
                                      key={bag.id}
                                      onClick={() => handleAssignBag(event.id, bag.id)}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 flex items-center gap-2"
                                    >
                                      <Briefcase className="h-3.5 w-3.5 text-pink-400" />
                                      {bag.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
