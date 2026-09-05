import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { sendPaymentVerificationEmails } from '@/app/api/bookings/route'

const schema = z.object({
  bookingId: z.string().trim().uuid(),
  status: z.enum(['paid', 'not_paid']),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment status request.' }, { status: 400 })
  const { bookingId, status } = parsed.data
  const paymentStatus = status === 'paid' ? 'PAYMENT_REPORTED' : 'PENDING'
  const result = await db.execute(sql`UPDATE bookings SET payment_status = ${paymentStatus} WHERE id = ${bookingId} AND booking_status = 'PENDING' RETURNING *`)
  if (!result.rows[0]) return NextResponse.json({ error: 'Booking was not found or is already processed.' }, { status: 404 })
  const emailResult = status === 'paid' ? await sendPaymentVerificationEmails(result.rows[0] as Record<string, unknown>) : { emailWarning: false }
  return NextResponse.json({ ok: true, paymentStatus, emailWarning: emailResult.emailWarning })
}
