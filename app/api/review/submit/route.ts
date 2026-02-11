import { NextRequest, NextResponse } from 'next/server'
import { redis, ReviewResponse } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { businessId, appointmentId, rating, feedback } = await req.json()

    if (!businessId || !appointmentId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating' },
        { status: 400 }
      )
    }

    // Determine action based on rating
    const action = rating === 5 ? 'google_review' : 'promo_code'

    // Get business GMB URL
    const business = await redis.get<any>(`business:${businessId}`)
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Store review response
    const response: ReviewResponse = {
      id: `${businessId}:${appointmentId}`,
      appointmentId,
      businessId,
      rating,
      feedback: rating <= 4 ? feedback : undefined,
      action,
      createdAt: new Date().toISOString(),
    }

    await redis.set(`review:${businessId}:${appointmentId}`, response)

    // Update appointment status
    const appointment = await redis.get<any>(`appointment:${businessId}:${appointmentId}`)
    if (appointment) {
      appointment.status = 'responded'
      await redis.set(`appointment:${businessId}:${appointmentId}`, appointment)
    }

    // Return appropriate response
    if (action === 'google_review') {
      return NextResponse.json({
        success: true,
        action: 'google_review',
        redirectUrl: business.gmbUrl,
      })
    } else {
      return NextResponse.json({
        success: true,
        action: 'promo_code',
        promoCode: `COMEBACK${Math.floor(Math.random() * 9000) + 1000}`,
        discount: '20% off',
      })
    }
  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
