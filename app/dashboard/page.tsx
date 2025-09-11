'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

interface UserStats {
  user: {
    id: string
    username: string
    email: string
    points: number
    accuracy_score: number
    prediction_streak: number
    rank: number
  }
  overview: {
    totalPredictions: number
    resolvedPredictions: number
    pendingPredictions: number
    averageAccuracy: number
    totalPoints: number
    totalPointsEarned: number
    currentStreak: number
  }
  accuracyHistory: Array<{
    predictionNumber: number
    accuracy: number
    date: string
    gpu: string
  }>
  timeframeStats: {
    '7d': number
    '30d': number
    '90d': number
  }
  recentActivity: Array<{
    id: string
    gpu: string
    predictedPrice: number
    currentPrice: number
    timeframe: string
    confidence: number
    created_at: string
    is_resolved: boolean
    accuracy_score?: number
    points_earned?: number
  }>
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/stats/${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400'
    if (accuracy >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-slate-300 mb-6">Please sign in to view your dashboard</p>
            <a href="/">
              <Button>Go to Home</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Error Loading Dashboard</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <Button onClick={fetchUserStats}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Home</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">My Predictions</a>
              <span className="text-slate-300 px-3 py-2">Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            👤 {stats.user.username || stats.user.email.split('@')[0]}'s Dashboard
          </h1>
          <p className="text-slate-300">
            Rank #{stats.user.rank} • {stats.overview.totalPoints} points • {stats.overview.currentStreak} prediction streak
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.overview.totalPredictions}</div>
              <div className="text-slate-400 text-sm">Total Predictions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-bold ${getAccuracyColor(stats.overview.averageAccuracy)}`}>
                {stats.overview.averageAccuracy.toFixed(1)}%
              </div>
              <div className="text-slate-400 text-sm">Average Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.overview.totalPoints}</div>
              <div className="text-slate-400 text-sm">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-400">{stats.overview.currentStreak}</div>
              <div className="text-slate-400 text-sm">Current Streak</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Chart */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Recent Accuracy Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.accuracyHistory.length > 0 ? (
                <div className="space-y-3">
                  {stats.accuracyHistory.slice(-5).map((point, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">{point.gpu}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm font-medium ${getAccuracyColor(point.accuracy)}`}>
                          {point.accuracy}%
                        </div>
                        <div className="w-20 bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              point.accuracy >= 80 ? 'bg-green-400' : 
                              point.accuracy >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.min(point.accuracy, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400">No resolved predictions yet</div>
                  <div className="text-slate-500 text-sm">Make predictions and wait for them to resolve</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prediction Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>⏰ Prediction Timeframes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">7 Days</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{stats.timeframeStats['7d']}</span>
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ 
                          width: `${stats.overview.totalPredictions > 0 ? (stats.timeframeStats['7d'] / stats.overview.totalPredictions) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">30 Days</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{stats.timeframeStats['30d']}</span>
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full"
                        style={{ 
                          width: `${stats.overview.totalPredictions > 0 ? (stats.timeframeStats['30d'] / stats.overview.totalPredictions) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">90 Days</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{stats.timeframeStats['90d']}</span>
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full"
                        style={{ 
                          width: `${stats.overview.totalPredictions > 0 ? (stats.timeframeStats['90d'] / stats.overview.totalPredictions) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Resolved</div>
                    <div className="text-green-400 font-semibold">{stats.overview.resolvedPredictions}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Pending</div>
                    <div className="text-yellow-400 font-semibold">{stats.overview.pendingPredictions}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>🕒 Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{activity.gpu}</div>
                      <div className="text-slate-400 text-sm">
                        Predicted ${activity.predictedPrice} • {formatDate(activity.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-300">
                        {activity.timeframe} • {activity.confidence}% confidence
                      </div>
                      <div className="text-sm">
                        {activity.is_resolved ? (
                          <span className={`font-medium ${getAccuracyColor(activity.accuracy_score || 0)}`}>
                            {activity.accuracy_score}% accuracy • +{activity.points_earned || 0} pts
                          </span>
                        ) : (
                          <span className="text-yellow-400">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-400">No predictions yet</div>
                <div className="text-slate-500 text-sm mb-4">Start making predictions to see your activity</div>
                <a href="/">
                  <Button>Make Prediction</Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}