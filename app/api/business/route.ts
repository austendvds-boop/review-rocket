import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { redis, Business } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, gmbId, gmbUrl, smsDelayHours = 24 } = await req.json()

    if (!name || !gmbId || !gmbUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const business: Business = {
      id: session.user.email,
      email: session.user.email,
      name,
      gmbId,
      gmbUrl,
      calendarConnected: false,
      smsDelayHours,
      createdAt: new Date().toISOString(),
    }

    await redis.set(`business:${business.id}`, business)

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await redis.get<Business>(`business:${session.user.email}`)

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Get business error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
