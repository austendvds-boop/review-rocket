'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gmbId: '',
    gmbUrl: '',
    smsDelayHours: 24,
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save business')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-white">Set Up Your Business</h1>
        <p className="text-slate-400 mb-8">Connect your Google My Business to start collecting reviews</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Google My Business ID</label>
            <input
              type="text"
              required
              value={formData.gmbId}
              onChange={(e) => setFormData({ ...formData, gmbId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
              placeholder="Found in your GMB URL"
            />
            <p className="text-xs text-slate-500 mt-1">
              Found in your Google My Business dashboard URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Google Review URL</label>
            <input
              type="url"
              required
              value={formData.gmbUrl}
              onChange={(e) => setFormData({ ...formData, gmbUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
              placeholder="https://g.page/.../review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Send SMS After Appointment (hours)
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
