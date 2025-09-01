'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function MyPredictions() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user predictions
    fetch('/api/predictions?userId=1')
      .then(res => res.json())
      .then(data => {
        setPredictions(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load predictions:', err)
        setLoading(false)
      })
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
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <Button variant="ghost">
                <a href="/">Dashboard</a>
              </Button>
              <Button variant="ghost">
                <a href="/leaderboard">Leaderboard</a>
              </Button>
              <Button variant="outline">Sign In</Button>
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
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Predictions Yet</h3>
              <p className="text-slate-400 mb-6">Start making predictions to appear on the leaderboard!</p>
              <Button asChild>
                <a href="/">Make Your First Prediction</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {predictions.map((prediction: any) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {prediction.gpuId.replace('-', ' ').toUpperCase()}
                    </CardTitle>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      prediction.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                      prediction.status === 'correct' ? 'bg-green-900 text-green-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {prediction.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-400 text-sm">Predicted Price</span>
                      <div className="text-white font-semibold">${prediction.predictedPrice}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Timeframe</span>
                      <div className="text-white font-semibold">{prediction.timeframe}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Confidence</span>
                      <div className="text-white font-semibold">{prediction.confidence}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Created</span>
                      <div className="text-white font-semibold">{formatDate(prediction.createdAt)}</div>
                    </div>
                  </div>
                  {prediction.reasoning && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">Reasoning:</span>
                      <p className="text-slate-300 mt-1">{prediction.reasoning}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
