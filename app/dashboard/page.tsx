'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  totalSMS: number
  fiveStar: number
  responseRate: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({
    totalSMS: 0,
    fiveStar: 0,
    responseRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchBusiness()
    }
  }, [status, router])

  const fetchBusiness = async () => {
    try {
      const response = await fetch('/api/business')
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.business)
        // TODO: Fetch actual stats from API
        setStats({
          totalSMS: 0,
          fiveStar: 0,
          responseRate: 0,
        })
      } else {
        router.push('/setup')
      }
    } catch (error) {
      console.error('Failed to fetch business:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">ReviewRocket</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{session.user?.email}</span>
            <Link
              href="/settings"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalSMS}</div>
            <div className="text-slate-400 text-sm">SMS Sent Today</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400 mb-1">{stats.fiveStar}</div>
            <div className="text-slate-400 text-sm">5-Star Reviews</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.responseRate}%</div>
            <div className="text-slate-400 text-sm">Response Rate</div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Business Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Name:</span>
              <span className="text-slate-200 ml-2">{business?.name}</span>
            </div>
            <div>
              <span className="text-slate-500">SMS Delay:</span>
              <span className="text-slate-200 ml-2">{business?.smsDelayHours} hours</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Google My Business:</span>
              <a
                href={business?.gmbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 ml-2"
              >
                View Profile
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/settings"
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
            <p className="text-slate-400 text-sm">
              Update your business info, SMS timing, and calendar connection
            </p>
          </Link>
          
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Connect Calendar</h3>
            <p className="text-slate-300 text-sm mb-4">
              Link your Google Calendar to automatically track appointments
            </p>
            <button
              onClick={() => alert('Calendar integration coming soon')}
              className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Connect Google Calendar
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
