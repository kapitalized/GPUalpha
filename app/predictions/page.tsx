'use client'

import { useState, useEffect } from 'react'

export default function MyPredictions() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPredictions([])
      setLoading(false)
    }, 1000)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading predictions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Dashboard</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <button className="border border-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800">Sign In</button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📊 My Predictions</h1>
          <p className="text-slate-300">Track your prediction accuracy and earn alpha points</p>
        </div>

        {predictions.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Predictions Yet</h3>
            <p className="text-slate-400 mb-6">Start making predictions to appear on the leaderboard!</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
            >
              Make Your First Prediction
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {predictions.map((prediction: any) => (
              <div key={prediction.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Prediction Details</h3>
                {/* Prediction content would go here */}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
