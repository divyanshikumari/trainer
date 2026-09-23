'use client'

import emailjs from '@emailjs/browser'

const serviceId = 'service_iby5wr'
const trainerTemplateId = 'template_8igy2xb'
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

export type BookingEmail = {
  id?: string
  full_name?: string
  email?: string
  mobile?: string
  package?: string
  sessions?: string
  training_type?: string
  preferred_date?: string
  preferred_time?: string
  payment_id?: string | null
  payment_status?: string
  booking_status?: string
}

function variables(booking: BookingEmail, adminPanelLink: string) {
  return {
    name: booking.full_name || '',
    email: booking.email || '',
    phone: booking.mobile || '',
    session_details: `${booking.package || ''} — ${booking.sessions || ''}`,
    training_type: booking.training_type || '',
    booking_date: booking.preferred_date || '',
    booking_time: booking.preferred_time || '',
    utr_number: booking.payment_id || 'Not provided',
    payment_status: booking.payment_status === 'CONFIRMED' || booking.payment_status === 'PAID' ? 'Confirmed' : 'Pending Verification',
    status: booking.booking_status === 'CONFIRMED' ? 'Confirmed' : booking.booking_status === 'REJECTED' ? 'Rejected' : 'Pending',
    admin_panel_link: adminPanelLink,
  }
}

async function send(templateId: string, params: Record<string, string>) {
  if (!publicKey) {
    const error = new Error('EmailJS public key is not configured at runtime. NEXT_PUBLIC_EMAILJS_PUBLIC_KEY is missing from the deployed client bundle.')
    console.error('[v0] EmailJS configuration error', { serviceId, templateId, hasPublicKey: false })
    throw error
  }

  try {
    return await emailjs.send(serviceId, templateId, params, publicKey)
  } catch (error) {
    const details = error && typeof error === 'object'
      ? { status: 'status' in error ? error.status : undefined, text: 'text' in error ? error.text : undefined, message: 'message' in error ? error.message : undefined }
      : { message: String(error) }
    console.error('[v0] EmailJS trainer send failed', { serviceId, templateId, hasPublicKey: true, parameterKeys: Object.keys(params), utrPresent: Boolean(params.utr_number && params.utr_number !== 'Not provided'), ...details })
    const message = [details.status && `status ${details.status}`, details.text || details.message].filter(Boolean).join(': ')
    throw new Error(`EmailJS trainer notification failed${message ? ` (${message})` : ''}`)
  }
}

export function sendTrainerBookingEmail(booking: BookingEmail) {
  return send(trainerTemplateId, variables(booking, `${window.location.origin}/admin`))
}
