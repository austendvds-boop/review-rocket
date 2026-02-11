'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ReviewPage() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')
  const appointmentId = searchParams.get('appointmentId')
  
  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!rating) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          appointmentId,
          rating,
          feedback: rating <= 4 ? feedback : undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitted(true)
        
        if (result.action === 'google_review') {
          // Redirect to Google My Business review page
          setTimeout(() => {
            window.location.href = result.redirectUrl
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    if (rating === 5) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">⭐⭐⭐⭐⭐</div>
            <h1 className="text-2xl font-bold text-white mb-2">Thank You!</h1>
            <p className="text-slate-400 mb-4">Redirecting you to Google to leave your review...</p>
            <div className="animate-pulse text-indigo-400">Redirecting...</div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-white mb-2">Thank You!</h1>
          <p className="text-slate-400">
            We appreciate your feedback. We'll use it to improve our service.
          </p>
          <div className="mt-6 p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Your promo code:</p>
            <div className="text-2xl font-bold text-green-400">COMEBACK20</div>
            <p className="text-xs text-slate-500 mt-2">20% off your next visit</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">How Was Your Experience?</h1>
          <p className="text-slate-400">Tap a star to rate your recent visit</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-4xl transition-transform hover:scale-110 ${
                rating && star <= rating ? 'text-yellow-400' : 'text-slate-600'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Rating Label */}
        {rating && (
          <div className="text-center mb-6">
            <span className="text-lg font-medium text-white">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Good'}
              {rating === 3 && 'Okay'}
              {rating === 2 && 'Not Great'}
              {rating === 1 && 'Poor'}
            </span>
          </div>
        )}

        {/* Feedback Form for 4 stars or below */}
        {rating && rating <= 4 && (
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">
              What could we do better? (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white resize-none"
              rows={3}
              placeholder="Tell us how we can improve..."
            />
          </div>
        )}

        {/* Submit Button */}
        {rating && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Submitting...' : rating === 5 ? 'Leave Google Review' : 'Submit Feedback'}
          </button>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Powered by ReviewRocket
        </p>
      </div>
    </div>
  )
}
