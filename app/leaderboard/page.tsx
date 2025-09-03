'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

interface LeaderboardUser {
  rank: number
  username: string
  predictions: number
  accuracy: number
  points: number
  streak: number
}

interface LeaderboardStats {
  totalPredictions: number
  activeUsers: number
  avgAccuracy: number
  maxStreak: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [stats, setStats] = useState<LeaderboardStats>({
    totalPredictions: 0,
    activeUsers: 0,
    avgAccuracy: 0,
    maxStreak: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            </div>
            <div className="flex space-x-4">
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Dashboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">My Predictions</a>
              <Button variant="outline">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-slate-300 mb-8">Top GPU prediction experts</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalPredictions.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Total Predictions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
              <div className="text-slate-400 text-sm">Active Predictors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.avgAccuracy}%</div>
              <div className="text-slate-400 text-sm">Avg Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.maxStreak}</div>
              <div className="text-slate-400 text-sm">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Top Predictors</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Predictions Yet</h3>
                <p className="text-slate-400 mb-6">Be the first to make a prediction and claim the top spot!</p>
                <a href="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Start Predicting 🎯
                  </Button>
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 text-left">
                      <th className="pb-3 text-slate-400 font-medium">Rank</th>
                      <th className="pb-3 text-slate-400 font-medium">Predictor</th>
                      <th className="pb-3 text-slate-400 font-medium">Predictions</th>
                      <th className="pb-3 text-slate-400 font-medium">Accuracy</th>
                      <th className="pb-3 text-slate-400 font-medium">Points</th>
                      <th className="pb-3 text-slate-400 font-medium">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((user) => (
                      <tr key={user.rank} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-4">
                          <div className="flex items-center">
                            {user.rank <= 3 && (
                              <span className="mr-2">
                                {user.rank === 1 && "🥇"}
                                {user.rank === 2 && "🥈"}
                                {user.rank === 3 && "🥉"}
                              </span>
                            )}
                            <span className="text-white font-semibold">#{user.rank}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-white font-medium">{user.username}</span>
                        </td>
                        <td className="py-4 text-slate-300">{user.predictions}</td>
                        <td className="py-4">
                          <span className={`font-semibold ${
                            user.accuracy >= 85 ? 'text-green-400' : 
                            user.accuracy >= 75 ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {user.accuracy}%
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-blue-400 font-semibold">{user.points.toLocaleString()}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <span className="text-orange-400 font-medium">{user.streak}</span>
                            {user.streak >= 10 && <span className="ml-1">🔥</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join CTA */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Want to Join the Leaderboard?</h3>
              <p className="text-slate-300 mb-6">Start making predictions and climb the rankings</p>
              <a href="/">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Start Predicting 🎯
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}