import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { logger } from '../../../lib/utils/logger'
import { rateLimiters } from '../../../lib/middleware/rateLimit'
import { LEADERBOARD_LIMIT } from '../../../lib/constants'

interface LeaderboardUser {
  id: string
  username: string | null
  email: string
  points: number
  accuracy_score: number
  prediction_streak: number
  predictions: Array<{ id: string }>
}

interface LeaderboardRow {
  rank: number
  id: string
  username: string
  predictions: number
  accuracy: number
  points: number
  streak: number
}

export async function GET(request: Request) {
  // Rate limiting
  const rateLimitResponse = rateLimiters.public(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Get user stats with prediction counts
    const { data: userStats, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        points,
        accuracy_score,
        prediction_streak,
        predictions!inner(id)
      `)
      .order('points', { ascending: false })
      .limit(LEADERBOARD_LIMIT)
    
    if (error) throw error
    
    // Format leaderboard data
    const leaderboard: LeaderboardRow[] = (userStats || []).map((user: LeaderboardUser, index: number) => ({
      rank: index + 1,
      id: user.id,
      username: user.username || user.email.split('@')[0],
      predictions: user.predictions.length,
      accuracy: user.accuracy_score || 0,
      points: user.points || 0,
      streak: user.prediction_streak || 0
    }))
    
    // Get overall stats in parallel (performance optimization)
    const [totalPredictionsResult, activeUsersResult, avgAccuracyResult] = await Promise.all([
      supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('points', 0),
      supabase
        .from('users')
        .select('accuracy_score')
        .gt('accuracy_score', 0)
    ])
    
    const totalPredictions = totalPredictionsResult.count || 0
    const activeUsers = activeUsersResult.count || 0
    
    const avgAccuracy = avgAccuracyResult.data && avgAccuracyResult.data.length > 0
      ? avgAccuracyResult.data.reduce((sum: number, user: { accuracy_score: number }) => sum + (user.accuracy_score || 0), 0) / avgAccuracyResult.data.length
      : 0
    
    const maxStreak = leaderboard.length > 0 
      ? Math.max(...leaderboard.map((user) => user.streak))
      : 0
    
    const stats = {
      totalPredictions,
      activeUsers,
      avgAccuracy: Number(avgAccuracy.toFixed(1)),
      maxStreak
    }
    
    return NextResponse.json({
      leaderboard,
      stats
    })
    
  } catch (error) {
    logger.error('Database error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}