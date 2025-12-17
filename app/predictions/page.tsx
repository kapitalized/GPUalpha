'use client'

import { useState, useEffect } from 'react'

interface Prediction {
  id: string
  predicted_price: number
  timeframe: string
  confidence: number
  reasoning?: string
  created_at: string
  is_resolved: boolean
  accuracy_score?: number
  points_earned?: number
  gpus: {
    model: string
    brand: string
    current_price: number
    msrp: number
  }
}

export default function MyPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      // For now, get all predictions since we don't have user auth yet
      const response = await fetch('/api/predictions')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPredictions(data)
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (prediction: Prediction) => {
    if (!prediction.is_resolved) return 'text-yellow-400'
    if (prediction.accuracy_score && prediction.accuracy_score >= 80) return 'text-green-400'
    if (prediction.accuracy_score && prediction.accuracy_score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusText = (prediction: Prediction) => {
    if (!prediction.is_resolved) return 'Pending'
    if (prediction.accuracy_score && prediction.accuracy_score >= 80) return 'Great Prediction!'
    if (prediction.accuracy_score && prediction.accuracy_score >= 60) return 'Good Prediction'
    return 'Needs Improvement'
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
              <a href="/overview" className="text-slate-300 hover:text-white px-3 py-2">Overview</a>
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Index</a>
              <a href="/info" className="text-slate-300 hover:text-white px-3 py-2">Info</a>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <a href="/analytics" className="text-slate-300 hover:text-white px-3 py-2">Analytics</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2 border-b-2 border-blue-500">Predictions</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📊 Recent Predictions</h1>
          <p className="text-slate-300">Track prediction accuracy and earn alpha points</p>
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
            {predictions.map((prediction) => (
              <div key={prediction.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-2">
                      {prediction.gpus.brand} {prediction.gpus.model}
                    </h3>
                    <div className="text-sm text-slate-400">
                      Made on {formatDate(prediction.created_at)}
                    </div>
                  </div>
                  <div className={`text-sm px-3 py-1 rounded ${getStatusColor(prediction)} bg-slate-800`}>
                    {getStatusText(prediction)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Predicted Price:</span>
                      <span className="text-white font-semibold">${prediction.predicted_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Price:</span>
                      <span className="text-slate-300">${prediction.gpus.current_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timeframe:</span>
                      <span className="text-slate-300">{prediction.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-slate-300">{prediction.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {prediction.is_resolved && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Accuracy Score:</span>
                          <span className={`font-semibold ${getStatusColor(prediction)}`}>
                            {prediction.accuracy_score}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Points Earned:</span>
                          <span className="text-blue-400 font-semibold">
                            +{prediction.points_earned || 0}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {prediction.reasoning && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-slate-400 text-sm mb-2">Reasoning:</div>
                    <div className="text-slate-300 text-sm">{prediction.reasoning}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}