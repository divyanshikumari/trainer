'use client'

import emailjs from '@emailjs/browser'

const serviceId = 'service_538puve'
const trainerTemplateId = 'template_8igy2xb'
const customerTemplateId = 'template_uihh5gu'
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
    payment_status: booking.payment_status === 'PAID' ? 'Payment Verified' : 'Pending Verification',
    status: booking.booking_status === 'CONFIRMED' ? 'Confirmed' : booking.booking_status === 'REJECTED' ? 'Rejected' : 'Pending',
    admin_panel_link: adminPanelLink,
  }
}

async function send(templateId: string, params: Record<string, string>) {
  if (!publicKey) throw new Error('EmailJS public key is not configured. Add NEXT_PUBLIC_EMAILJS_PUBLIC_KEY.')
  return emailjs.send(serviceId, templateId, params, { publicKey })
}

export function sendTrainerBookingEmail(booking: BookingEmail) {
  return send(trainerTemplateId, variables(booking, `${window.location.origin}/admin`))
}

export function sendCustomerConfirmationEmail(booking: BookingEmail) {
  return send(customerTemplateId, variables(booking, ''))
}
