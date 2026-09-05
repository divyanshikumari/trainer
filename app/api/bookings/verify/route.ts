import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { sendConfirmationEmails } from '@/app/api/bookings/route'

export const maxDuration = 15

export async function POST(request: Request) {
  try {
    const key = request.headers.get('x-trainer-verification-key')
    if (!process.env.TRAINER_VERIFICATION_KEY || key !== process.env.TRAINER_VERIFICATION_KEY) return NextResponse.json({ error: 'Verification is not authorized.' }, { status: 403 })
    const body = await request.json() as { bookingId?: unknown }
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId.trim() : ''
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingId)) return NextResponse.json({ error: 'A valid booking ID is required.' }, { status: 400 })
    const result = await db.execute(sql`UPDATE bookings SET payment_status = 'PAID', booking_status = 'CONFIRMED', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP) WHERE id = ${bookingId} AND payment_status IN ('PENDING', 'PAYMENT_REPORTED') AND booking_status = 'PENDING' RETURNING *`)
    if (!result.rows[0]) return NextResponse.json({ error: 'Booking not found, already confirmed, or payment has not been reported.' }, { status: 409 })
    const emailResult = await sendConfirmationEmails(result.rows[0] as Record<string, unknown>)
    return NextResponse.json({ success: true, paymentStatus: 'PAID', bookingStatus: 'CONFIRMED', emailWarning: emailResult.emailWarning, trainerRecipient: emailResult.trainerRecipient })
  } catch (error) {
    console.error('[v0] Trainer booking verification failed:', error)
    return NextResponse.json({ error: 'Booking verification could not be completed.' }, { status: 500 })
  }
}
