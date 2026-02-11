import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

// Business
export interface Business {
  id: string
  email: string
  name: string
  gmbId: string
  gmbUrl: string
  calendarConnected: boolean
  smsDelayHours: number
  createdAt: string
}

export async function getBusiness(id: string): Promise<Business | null> {
  return redis.get(`business:${id}`)
}

export async function setBusiness(business: Business) {
  await redis.set(`business:${business.id}`, business)
}

// Appointment
export interface Appointment {
  id: string
  businessId: string
  customerPhone: string
  customerName?: string
  appointmentTime: string
  status: 'pending' | 'sms_sent' | 'responded'
  smsSentAt?: string
  createdAt: string
}

export async function getAppointments(businessId: string): Promise<Appointment[]> {
  const keys = await redis.keys(`appointment:${businessId}:*`)
  if (keys.length === 0) return []
  return redis.mget(...keys) as Promise<Appointment[]>
}

export async function setAppointment(appointment: Appointment) {
  await redis.set(
    `appointment:${appointment.businessId}:${appointment.id}`,
    appointment
  )
}

// Review Response
export interface ReviewResponse {
  id: string
  appointmentId: string
  businessId: string
  rating: number
  feedback?: string
  action: 'google_review' | 'promo_code'
  createdAt: string
}

export async function setReviewResponse(response: ReviewResponse) {
  await redis.set(
    `review:${response.businessId}:${response.appointmentId}`,
    response
  )
}

export async function getReviewStats(businessId: string) {
  const keys = await redis.keys(`review:${businessId}:*`)
  if (keys.length === 0) {
    return { total: 0, fiveStar: 0, fourStarOrBelow: 0, conversionRate: 0 }
  }
  
  const reviews = (await redis.mget(...keys)) as ReviewResponse[]
  const total = reviews.length
  const fiveStar = reviews.filter(r => r.rating === 5).length
  const fourStarOrBelow = reviews.filter(r => r.rating <= 4).length
  
  return {
    total,
    fiveStar,
    fourStarOrBelow,
    conversionRate: total > 0 ? Math.round((fiveStar / total) * 100) : 0,
  }
}
