import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const packages: Record<string, { amount: number; sessions: string }> = {
  'Normal Training': { amount: 3000, sessions: '20 Sessions' },
  'Advanced Personal Training': { amount: 3800, sessions: '20 Sessions' },
  'Partner Training': { amount: 4600, sessions: 'Partner Training' },
  'Online Personal Training': { amount: 3400, sessions: '20 Sessions' },
}
const bookingSchema = z.object({
  fullName: z.string().trim().min(2).max(100), mobile: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/), email: z.string().trim().email().max(160), address: z.string().trim().max(300).optional(), joiningDate: z.preprocess((value) => value === '' ? undefined : value, z.string().optional()), height: z.coerce.number().int().positive().max(260).optional(), weight: z.coerce.number().positive().max(400).optional(), bodyFat: z.coerce.number().min(0).max(100).optional(), physicalProblems: z.string().trim().max(1000).optional(), fitnessGoals: z.array(z.string()).min(1), trainingType: z.string().min(1), package: z.string().transform((value) => value.split(' — ')[0]).pipe(z.enum(['Normal Training', 'Advanced Personal Training', 'Partner Training', 'Online Personal Training'])), preferredDate: z.string().min(1), preferredTime: z.string().min(1), alternativeDateTime: z.string().trim().max(200).optional(), fitnessLevel: z.string().max(200).optional(), previousExperience: z.string().max(1000).optional(), specificGoal: z.string().max(1000).optional(), additionalMessage: z.string().max(1000).optional(), consent: z.literal(true),
})
const paymentSchema = z.object({ bookingId: z.union([z.string(), z.number()]), paymentId: z.string().trim().max(120).optional() })
const esc = (value: unknown) => String(value ?? '').replace(/[<>]/g, '')
const withTimeout = <T,>(promise: Promise<T>, ms: number) => Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Email request timed out')), ms))])
export const maxDuration = 15

export async function POST(request: Request) {
  try {
    const parsed = bookingSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Please complete all required fields with valid information.' }, { status: 400 })
    const data = parsed.data
    const pricing = packages[data.package]
    const result = await db.execute(sql`INSERT INTO bookings (full_name, mobile, email, address, joining_date, height, weight, body_fat, physical_problems, fitness_goals, training_type, package, preferred_date, preferred_time, alternative_date_time, fitness_level, previous_experience, specific_goal, additional_message, consent, amount, payment_status, booking_status) VALUES (${data.fullName}, ${data.mobile}, ${data.email}, ${data.address || null}, ${data.joiningDate || null}, ${data.height || null}, ${data.weight || null}, ${data.bodyFat || null}, ${data.physicalProblems || null}, ${sql`ARRAY[${sql.join(data.fitnessGoals.map((goal) => sql`${goal}`), sql`, `)}]::text[]`}, ${data.trainingType}, ${data.package}, ${data.preferredDate}, ${data.preferredTime}, ${data.alternativeDateTime || null}, ${data.fitnessLevel || null}, ${data.previousExperience || null}, ${data.specificGoal || null}, ${data.additionalMessage || null}, ${data.consent}, ${pricing.amount}, 'PENDING', 'PENDING') RETURNING id`)
    const bookingId = result.rows[0]?.id
    return NextResponse.json({ success: true, bookingId, package: data.package, amount: pricing.amount, sessions: pricing.sessions, paymentStatus: 'PENDING', bookingStatus: 'PENDING', upiId: process.env.UPI_ID || 'pappusgnps-1@oksbi', qrCodeUrl: process.env.UPI_QR_CODE_URL || '/upi-qr.jpg', refundPolicy: 'Result Guarantee: If no results are achieved under the applicable terms, ₹2,000 will be refunded.' })
  } catch (error) {
    console.error('[v0] Booking creation failed:', error)
    return NextResponse.json({ error: 'We could not save your booking right now. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const parsed = paymentSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid payment transaction reference.' }, { status: 400 })
    const bookingId = parsed.data.bookingId
    const update = await db.execute(sql`UPDATE bookings SET payment_id = ${parsed.data.paymentId}, payment_status = 'PAID', booking_status = 'CONFIRMED', paid_at = CURRENT_TIMESTAMP WHERE id = ${bookingId} AND payment_status = 'PENDING' RETURNING *`)
    if (!update.rows[0]) return NextResponse.json({ error: 'Booking is already confirmed or could not be found.' }, { status: 409 })
    const booking = update.rows[0] as Record<string, unknown>
    const resend = process.env.RESEND_API_KEY && process.env.TRAINER_EMAIL ? new Resend(process.env.RESEND_API_KEY) : null
    if (!resend) return NextResponse.json({ success: true, emailWarning: true, paymentStatus: 'PAID', bookingStatus: 'CONFIRMED' })
    const from = process.env.EMAIL_FROM || 'PM Fitness Coach <onboarding@resend.dev>'
    const summary = Object.entries(booking).map(([key, value]) => `<p><strong>${esc(key)}:</strong> ${esc(value)}</p>`).join('')
    const [trainer, customer] = await Promise.allSettled([
      withTimeout(resend.emails.send({ from, to: process.env.TRAINER_EMAIL, subject: `New Paid Session Booking — ${esc(booking.full_name)}`, html: `<h2>Payment Received — Booking Confirmed</h2>${summary}` }), 5000),
      withTimeout(resend.emails.send({ from, to: String(booking.email), subject: 'PM Fitness Coach — Session Confirmed', html: `<h2>Your payment has been received and your session is confirmed.</h2>${summary}` }), 5000),
    ])
    const emailWarning = trainer.status === 'rejected' || customer.status === 'rejected'
    if (emailWarning) console.error('[v0] Paid booking saved but email delivery failed', { bookingId })
    return NextResponse.json({ success: true, emailWarning, paymentStatus: 'PAID', bookingStatus: 'CONFIRMED' })
  } catch (error) {
    console.error('[v0] Payment verification failed:', error)
    return NextResponse.json({ error: 'Payment verification could not be completed.' }, { status: 500 })
  }
}
