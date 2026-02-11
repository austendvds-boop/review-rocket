'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gmbId: '',
    gmbUrl: '',
    smsDelayHours: 24,
  })

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
        setFormData({
          name: data.business.name || '',
          gmbId: data.business.gmbId || '',
          gmbUrl: data.business.gmbUrl || '',
          smsDelayHours: data.business.smsDelayHours || 24,
        })
      }
    } catch (error) {
      console.error('Failed to fetch business:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Settings saved!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleCalendarSync = async () => {
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session?.accessToken }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Synced ${data.appointmentsSynced} appointments!`)
      } else {
        alert('Failed to sync calendar')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            ← ReviewRocket
          </Link>
          <span className="text-slate-400">Settings</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Business Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Google My Business ID</label>
                <input
                  type="text"
                  value={formData.gmbId}
                  onChange={(e) => setFormData({ ...formData, gmbId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Google Review URL</label>
                <input
                  type="url"
                  value={formData.gmbUrl}
                  onChange={(e) => setFormData({ ...formData, gmbUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">SMS Settings</h2>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Send SMS After Appointment
              </label>
              <select
                value={formData.smsDelayHours}
                onChange={(e) => setFormData({ ...formData, smsDelayHours: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours (recommended)</option>
                <option value={48}>48 hours</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Calendar Integration</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300">Google Calendar</p>
                <p className="text-sm text-slate-500">
                  {business?.calendarConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCalendarSync}
                className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Sync Now
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <Link
              href="/dashboard"
              className="px-6 py-4 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
