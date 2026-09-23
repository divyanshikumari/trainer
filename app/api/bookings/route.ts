import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const packages: Record<string, { amount: number; sessions: string[]; resultGuarantee: boolean }> = {
  'Normal Training': { amount: 3000, sessions: ['20 Sessions'], resultGuarantee: true },
  'Advanced Personal Training': { amount: 3800, sessions: ['20 Sessions'], resultGuarantee: true },
  'Partner Training': { amount: 4600, sessions: ['Partner Training'], resultGuarantee: true },
  'Online Personal Training': { amount: 3400, sessions: ['20 Sessions'], resultGuarantee: true },
}
const optionalNumber = (schema: z.ZodTypeAny) => z.preprocess((value) => value === '' || value === null || value === undefined ? undefined : value, schema.optional())
const optionalText = z.preprocess((value) => value === '' || value === null || value === undefined ? undefined : value, z.string().trim().max(1000).optional())
const bookingSchema = z.object({
  fullName: z.string().trim().min(2).max(100), mobile: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/), email: z.string().trim().email().max(160), address: z.string().trim().max(300).optional(), joiningDate: z.preprocess((value) => value === '' ? undefined : value, z.string().optional()), height: optionalNumber(z.coerce.number().int().positive().max(260)), weight: optionalNumber(z.coerce.number().positive().max(400)), bodyFat: optionalNumber(z.coerce.number().min(0).max(100)), physicalProblems: optionalText, fitnessGoals: z.array(z.string()).min(1), trainingType: z.string().min(1), package: z.string().transform((value) => value.split(' — ')[0]).pipe(z.enum(['Normal Training', 'Advanced Personal Training', 'Partner Training', 'Online Personal Training'])), sessions: z.string().min(1), sessionStartingDate: z.string().min(1), preferredDate: z.string().min(1), preferredTime: z.string().min(1), alternativeDateTime: z.string().trim().max(200).optional(), fitnessLevel: z.string().max(200).optional(), previousExperience: z.string().max(1000).optional(), specificGoal: z.string().max(1000).optional(), additionalMessage: z.string().max(1000).optional(), consent: z.literal(true),
})
const paymentSchema = z.object({ bookingId: z.string().trim().min(1).max(100), paymentId: z.string().trim().min(1).max(120) })
const guaranteeText = '₹2,000 Result Guarantee – If no results are achieved under the applicable terms, ₹2,000 will be refunded.'
export const maxDuration = 15

function paymentDetails(bookingId: string, amount: number) {
  const upiId = process.env.UPI_ID || 'pappusgnps-1@oksbi'
  const payee = 'Pappu Kumar'
  const reference = `PMFIT-${bookingId}`
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payee)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(reference)}`
  return { upiId, payee, reference, upiLink, qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(upiLink)}` }
}

export async function POST(request: Request) {
  try {
    const parsed = bookingSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Please complete all required fields with valid information.' }, { status: 400 })
    const data = parsed.data
    const pricing = packages[data.package]
    if (!pricing.sessions.includes(data.sessions)) return NextResponse.json({ error: 'That session option is not available for this package.' }, { status: 400 })
    const result = await db.execute(sql`INSERT INTO bookings (full_name, mobile, email, address, joining_date, height, weight, body_fat, physical_problems, fitness_goals, training_type, package, sessions, session_starting_date, result_guarantee, preferred_date, preferred_time, alternative_date_time, fitness_level, previous_experience, specific_goal, additional_message, consent, amount, payment_status, booking_status) VALUES (${data.fullName}, ${data.mobile}, ${data.email}, ${data.address || null}, ${data.joiningDate || null}, ${data.height || null}, ${data.weight || null}, ${data.bodyFat || null}, ${data.physicalProblems || null}, ${sql`ARRAY[${sql.join(data.fitnessGoals.map((goal) => sql`${goal}`), sql`, `)}]::text[]`}, ${data.trainingType}, ${data.package}, ${data.sessions}, ${data.sessionStartingDate}, ${pricing.resultGuarantee}, ${data.preferredDate}, ${data.preferredTime}, ${data.alternativeDateTime || null}, ${data.fitnessLevel || null}, ${data.previousExperience || null}, ${data.specificGoal || null}, ${data.additionalMessage || null}, ${data.consent}, ${pricing.amount}, 'PENDING', 'PENDING') RETURNING id`)
    const bookingId = String(result.rows[0]?.id || '')
    if (!bookingId) return NextResponse.json({ error: 'Booking was saved but no Booking ID was returned. Please try again.' }, { status: 500 })
    return NextResponse.json({ success: true, bookingId, package: data.package, amount: pricing.amount, sessions: data.sessions, sessionStartingDate: data.sessionStartingDate, paymentStatus: 'PENDING', bookingStatus: 'PENDING', resultGuarantee: pricing.resultGuarantee, refundPolicy: pricing.resultGuarantee ? guaranteeText : null, ...paymentDetails(bookingId, pricing.amount) })
  } catch (error) {
    console.error('[v0] Booking creation failed:', error)
    return NextResponse.json({ error: 'We could not save your booking right now. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const parsed = paymentSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Please enter a UTR / transaction reference and a valid booking ID.' }, { status: 400 })
    const update = await db.execute(sql`UPDATE bookings SET payment_id = ${parsed.data.paymentId || null} WHERE id = ${parsed.data.bookingId} AND payment_status = 'PENDING' AND booking_status = 'PENDING' RETURNING id, payment_status, booking_status`)
    if (!update.rows[0]) return NextResponse.json({ error: 'Booking is already submitted or could not be found.' }, { status: 409 })
    return NextResponse.json({ success: true, paymentStatus: 'PENDING', bookingStatus: 'PENDING', message: 'Payment reference submitted for trainer verification. Your booking remains pending.' })
  } catch (error) {
    console.error('[v0] Payment reference submission failed:', error)
    return NextResponse.json({ error: 'Payment reference could not be saved.' }, { status: 500 })
  }
}
