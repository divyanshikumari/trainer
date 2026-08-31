import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const schema = z.object({
  bookingId: z.coerce.number().int().positive(),
  status: z.enum(['paid', 'not_paid']),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment status request.' }, { status: 400 })
  const { bookingId, status } = parsed.data
  const paymentStatus = status === 'paid' ? 'PAYMENT_REPORTED' : 'PENDING'
  await db.execute(sql`UPDATE bookings SET payment_status = ${paymentStatus} WHERE id = ${bookingId}`)
  return NextResponse.json({ ok: true, paymentStatus })
}
