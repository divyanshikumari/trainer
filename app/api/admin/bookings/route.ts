import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

function authorized(request: Request) {
  const key = process.env.TRAINER_VERIFICATION_KEY || process.env.ADMIN_DASHBOARD_KEY
  return Boolean(key && request.headers.get('x-admin-key') === key)
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Admin access is not authorized.' }, { status: 401 })
  const result = await db.execute(sql`SELECT id, full_name, email, mobile, package, sessions, training_type, preferred_date, preferred_time, payment_id, payment_status, booking_status, created_at, paid_at FROM bookings ORDER BY created_at DESC`)
  return NextResponse.json({ bookings: result.rows })
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Admin access is not authorized.' }, { status: 401 })
  const body = await request.json() as { bookingId?: unknown; action?: unknown }
  const bookingId = typeof body.bookingId === 'string' ? body.bookingId.trim() : ''
  if (!bookingId || !['reject'].includes(body.action as string)) return NextResponse.json({ error: 'Invalid admin action.' }, { status: 400 })
  const result = await db.execute(sql`UPDATE bookings SET booking_status = 'REJECTED', payment_status = 'NOT_VERIFIED' WHERE id = ${bookingId} AND booking_status = 'PENDING' RETURNING id, booking_status, payment_status`)
  if (!result.rows[0]) return NextResponse.json({ error: 'Booking was not found or is already processed.' }, { status: 409 })
  return NextResponse.json({ success: true, booking: result.rows[0] })
}
