import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const bookingSchema = z.object({
  fullName: z.string().trim().min(2).max(100), mobile: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/), email: z.string().trim().email().max(160), address: z.string().trim().max(300).optional(), joiningDate: z.string().optional(), height: z.coerce.number().int().positive().max(260).optional(), weight: z.coerce.number().positive().max(400).optional(), bodyFat: z.coerce.number().min(0).max(100).optional(), physicalProblems: z.string().trim().max(1000).optional(), fitnessGoals: z.array(z.string()).min(1), trainingType: z.string().min(1), package: z.string().min(1), preferredDate: z.string().min(1), preferredTime: z.string().min(1), alternativeDateTime: z.string().trim().max(200).optional(), fitnessLevel: z.string().max(200).optional(), previousExperience: z.string().max(1000).optional(), specificGoal: z.string().max(1000).optional(), additionalMessage: z.string().max(1000).optional(), consent: z.literal(true),
})

const esc = (value: unknown) => String(value ?? '').replace(/[<>]/g, '')
const withTimeout = <T,>(promise: Promise<T>, ms: number) => Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Email request timed out')), ms))])

export const maxDuration = 15

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Please complete all required fields with valid information.' }, { status: 400 })
    const data = parsed.data
    const result = await db.execute(sql`INSERT INTO bookings (full_name, mobile, email, address, joining_date, height, weight, body_fat, physical_problems, fitness_goals, training_type, package, preferred_date, preferred_time, alternative_date_time, fitness_level, previous_experience, specific_goal, additional_message, consent) VALUES (${data.fullName}, ${data.mobile}, ${data.email}, ${data.address || null}, ${data.joiningDate || null}, ${data.height || null}, ${data.weight || null}, ${data.bodyFat || null}, ${data.physicalProblems || null}, ${sql`ARRAY[${sql.join(data.fitnessGoals.map((goal) => sql`${goal}`), sql`, `)}]::text[]`}, ${data.trainingType}, ${data.package}, ${data.preferredDate}, ${data.preferredTime}, ${data.alternativeDateTime || null}, ${data.fitnessLevel || null}, ${data.previousExperience || null}, ${data.specificGoal || null}, ${data.additionalMessage || null}, ${data.consent}) RETURNING id`)
    const bookingId = result.rows[0]?.id
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
    const from = process.env.EMAIL_FROM || 'PM Fitness Coach <onboarding@resend.dev>'
    const summary = `<p><strong>Client:</strong> ${esc(data.fullName)}</p><p><strong>Mobile:</strong> ${esc(data.mobile)}</p><p><strong>Email:</strong> ${esc(data.email)}</p><p><strong>Training:</strong> ${esc(data.trainingType)}</p><p><strong>Goals:</strong> ${esc(data.fitnessGoals.join(', '))}</p><p><strong>Package:</strong> ${esc(data.package)}</p><p><strong>Preferred:</strong> ${esc(data.preferredDate)} at ${esc(data.preferredTime)}</p><p><strong>Physical details:</strong> ${esc([data.height && `${data.height} cm`, data.weight && `${data.weight} kg`, data.bodyFat && `${data.bodyFat}% body fat`].filter(Boolean).join(', '))}</p><p><strong>Additional:</strong> ${esc(data.additionalMessage || 'None')}</p>`
    let emailWarning = false
    if (!resend || !process.env.TRAINER_EMAIL) {
      emailWarning = true
      console.warn('[v0] Booking saved but email is not configured. Add RESEND_API_KEY, TRAINER_EMAIL, and EMAIL_FROM.')
    } else {
      const [trainerEmail, clientEmail] = await Promise.allSettled([
        withTimeout(resend.emails.send({ from, to: process.env.TRAINER_EMAIL, subject: 'New Session Booking Request – PM Fitness Coach', html: `<h2>New booking request</h2>${summary}<p>Booking ID: ${esc(bookingId)}</p>` }), 5000),
        withTimeout(resend.emails.send({ from, to: data.email, subject: 'PM Fitness Coach – Booking Request Received', html: `<h2>Booking request received</h2><p>Hi ${esc(data.fullName)},</p><p>Thank you for choosing PM Fitness Coach. We have received your session booking request successfully.</p>${summary}<p>Pappu Kumar will contact you shortly to confirm the session.</p><p>Thank you,<br />PM Fitness Coach<br />Ramgarh, Jharkhand<br />9334349698</p>` }), 5000),
      ])
      emailWarning = trainerEmail.status === 'rejected' || clientEmail.status === 'rejected'
      if (emailWarning) console.error('[v0] Booking saved but one or more emails failed.')
    }
    return NextResponse.json({ success: true, emailWarning })
  } catch (error) {
    console.error('[v0] Booking request failed:', error)
    return NextResponse.json({ error: 'We could not submit your request right now. Please try again.' }, { status: 500 })
  }
}
