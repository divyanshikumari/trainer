'use client'

import { useState } from 'react'
import { sendCustomerConfirmationEmail } from '@/lib/emailjs'

type Booking = Record<string, any>
const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'REJECTED'] as const

export default function AdminPage() {
  const [key, setKey] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tab, setTab] = useState<(typeof tabs)[number]>('ALL')
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  async function load() {
    setError('')
    const response = await fetch('/api/admin/bookings', { headers: { 'x-admin-key': key } })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Could not load bookings.'); return }
    setBookings(result.bookings)
    setLoaded(true)
  }

  async function action(booking: Booking, type: 'confirm' | 'reject') {
    setError('')
    const response = type === 'confirm'
      ? await fetch('/api/bookings/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-trainer-verification-key': key }, body: JSON.stringify({ bookingId: booking.id }) })
      : await fetch('/api/admin/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': key }, body: JSON.stringify({ bookingId: booking.id, action: 'reject' }) })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Action failed.'); return }
    if (type === 'confirm') {
      try { await sendCustomerConfirmationEmail({ ...booking, ...(result.booking || {}), payment_status: 'PAID', booking_status: 'CONFIRMED' }) } catch (emailError) { setError(emailError instanceof Error ? emailError.message : 'Customer email could not be sent.'); return }
    }
    await load()
  }

  const visible = bookings.filter((booking) => tab === 'ALL' || (tab === 'PENDING' ? booking.booking_status === 'PENDING' : booking.booking_status === tab))
  if (!loaded) return <main className="min-h-screen bg-[#f5efe7] px-5 py-12 text-[#24201d]"><div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-xl"><p className="text-xs font-black tracking-[0.25em] text-[#e85d2a]">PM FITNESS COACH</p><h1 className="mt-3 text-4xl font-black uppercase">Trainer admin</h1><p className="mt-3 text-sm leading-6 text-[#665e58]">Enter the trainer verification key to view and manage bookings.</p><input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Trainer verification key" className="mt-6 min-h-12 w-full rounded-xl border border-black/15 px-4" /><button onClick={load} className="mt-4 min-h-12 w-full rounded-xl bg-[#e85d2a] font-black tracking-wide text-white">OPEN BOOKINGS</button>{error && <p role="alert" className="mt-4 text-sm font-bold text-red-700">{error}</p>}</div></main>
  return <main className="min-h-screen bg-[#f5efe7] px-4 py-8 text-[#24201d] sm:px-6"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[0.25em] text-[#e85d2a]">PM FITNESS COACH</p><h1 className="mt-2 text-4xl font-black uppercase">Bookings</h1></div><button onClick={load} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-xs font-black">REFRESH</button></div><div className="mt-6 flex gap-2 overflow-x-auto">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-xs font-black ${tab === item ? 'bg-[#e85d2a] text-white' : 'bg-white'}`}>{item}</button>)}</div>{error && <p role="alert" className="mt-4 text-sm font-bold text-red-700">{error}</p>}<div className="mt-6 grid gap-4">{visible.map((booking) => <article key={booking.id} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-black">{booking.full_name}</h2><p className="text-sm text-[#665e58]">{booking.email} · {booking.mobile}</p></div><div className="text-right text-xs font-black"><p>{booking.booking_status}</p><p className="text-[#e85d2a]">{booking.payment_status}</p></div></div><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><p><b>Package:</b> {booking.package} — {booking.sessions}</p><p><b>Training:</b> {booking.training_type}</p><p><b>Date:</b> {booking.preferred_date}</p><p><b>Time:</b> {booking.preferred_time}</p><p><b>UTR:</b> {booking.payment_id || 'Not provided'}</p><p><b>Created:</b> {String(booking.created_at || '').slice(0, 19).replace('T', ' ')}</p></div>{booking.booking_status === 'PENDING' && <div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={() => action(booking, 'confirm')} className="min-h-12 rounded-xl bg-[#e85d2a] px-4 text-sm font-black text-white">VERIFY PAYMENT &amp; CONFIRM</button><button onClick={() => action(booking, 'reject')} className="min-h-12 rounded-xl border border-red-200 px-4 text-sm font-black text-red-700">REJECT</button></div>}</article>)}{visible.length === 0 && <p className="rounded-2xl bg-white p-8 text-center font-bold">No bookings in this tab.</p>}</div></div></main>
}
