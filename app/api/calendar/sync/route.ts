import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { redis, Appointment } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { accessToken } = await req.json()
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 400 }
      )
    }

    // Fetch Google Calendar events
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
      'timeMin=' + new Date().toISOString() +
      '&maxResults=50' +
      '&singleEvents=true' +
      '&orderBy=startTime',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Calendar API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const events = data.items || []

    // Parse appointments and extract phone numbers
    const appointments: Appointment[] = events
      .filter((event: any) => {
        // Only events with attendees (appointments)
        return event.attendees && event.attendees.length > 0
      })
      .map((event: any) => {
        // Extract phone number from description or summary
        const phoneMatch = 
          event.description?.match(/(\+?1?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/) ||
          event.summary?.match(/(\+?1?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)
        
        const attendee = event.attendees?.[0]
        
        return {
          id: event.id,
          businessId: session.user.email,
          customerPhone: phoneMatch ? phoneMatch[0].replace(/\D/g, '') : '',
          customerName: attendee?.displayName || attendee?.email?.split('@')[0] || 'Customer',
          appointmentTime: event.start.dateTime || event.start.date,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      })
      .filter((apt: Appointment) => apt.customerPhone) // Only appointments with phone numbers

    // Save appointments to Redis
    for (const apt of appointments) {
      await redis.set(`appointment:${apt.businessId}:${apt.id}`, apt)
    }

    // Update business record
    const business = await redis.get<any>(`business:${session.user.email}`)
    if (business) {
      business.calendarConnected = true
      await redis.set(`business:${session.user.email}`, business)
    }

    return NextResponse.json({
      success: true,
      appointmentsSynced: appointments.length,
      appointments,
    })
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
