'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'

interface UserProfileData {
  user: {
    id: string
    username: string
    email: string
    points: number
    accuracy_score: number
    prediction_streak: number
    rank: number
    created_at: string
  }
  overview: {
    totalPredictions: number
    resolvedPredictions: number
    pendingPredictions: number
    averageAccuracy: number
    totalPoints: number
    currentStreak: number
  }
  recentActivity: Array<{
    id: string
    gpu: string
    predictedPrice: number
    timeframe: string
    confidence: number
    created_at: string
    is_resolved: boolean
    accuracy_score?: number
  }>
}

export default function UserProfile({ params }: { params: { id: string } }) {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [params.id])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/stats/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to load profile')
      }
      const data = await response.json()
      setProfileData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400'
    if (accuracy >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-white mb-4">Profile Not Found</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <a href="/leaderboard">
              <Button>Back to Leaderboard</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <a href="/overview" className="text-slate-300 hover:text-white px-3 py-2">Overview</a>
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Index</a>
              <a href="/gpu-info" className="text-slate-300 hover:text-white px-3 py-2">GPU Info</a>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <a href="/analytics" className="text-slate-300 hover:text-white px-3 py-2">Analytics</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">Predictions</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profileData.user.username ? profileData.user.username[0].toUpperCase() : profileData.user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {profileData.user.username || profileData.user.email.split('@')[0]}
              </h1>
              <p className="text-slate-300">
                Rank #{profileData.user.rank} • Member since {formatDate(profileData.user.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400">{profileData.overview.totalPredictions}</div>
              <div className="text-slate-400 text-sm">Total Predictions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-bold ${getAccuracyColor(profileData.overview.averageAccuracy)}`}>
                {profileData.overview.averageAccuracy.toFixed(1)}%
              </div>
              <div className="text-slate-400 text-sm">Average Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400">{profileData.user.points}</div>
              <div className="text-slate-400 text-sm">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-400">{profileData.user.prediction_streak}</div>
              <div className="text-slate-400 text-sm">Current Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Recent Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {profileData.recentActivity.map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{prediction.gpu}</div>
                      <div className="text-slate-400 text-sm">
                        Predicted ${prediction.predictedPrice} • {new Date(prediction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-300 text-sm">
                        {prediction.timeframe} • {prediction.confidence}% confidence
                      </div>
                      <div className="text-sm">
                        {prediction.is_resolved ? (
                          <span className={`font-medium ${getAccuracyColor(prediction.accuracy_score || 0)}`}>
                            {prediction.accuracy_score}% accuracy
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
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}