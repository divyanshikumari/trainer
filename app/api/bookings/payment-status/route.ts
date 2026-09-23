import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const schema = z.object({
  bookingId: z.string().trim().uuid(),
  status: z.enum(['paid', 'not_paid']),
  paymentId: z.string().trim().max(120).optional(),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment status request.' }, { status: 400 })
  const { bookingId, status, paymentId } = parsed.data
  const paymentStatus = status === 'paid' ? 'PAYMENT_REPORTED' : 'PENDING'
  const result = await db.execute(sql`UPDATE bookings SET payment_status = ${paymentStatus}, payment_id = ${status === 'paid' ? paymentId || null : null} WHERE id = ${bookingId} AND booking_status = 'PENDING' RETURNING *`)
  if (!result.rows[0]) return NextResponse.json({ error: 'Booking was not found or is already processed.' }, { status: 404 })
  return NextResponse.json({ ok: true, paymentStatus, booking: result.rows[0] })
}
