import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
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
      .limit(20)
    
    if (error) throw error
    
    // Format leaderboard data
    const leaderboard = userStats.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username || user.email.split('@')[0],
      predictions: user.predictions.length,
      accuracy: user.accuracy_score || 0,
      points: user.points || 0,
      streak: user.prediction_streak || 0
    }))
    
    // Get overall stats
    const { data: totalPredictions } = await supabase
      .from('predictions')
      .select('id', { count: 'exact' })
    
    const { data: activeUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gt('points', 0)
    
    const { data: avgAccuracy } = await supabase
      .from('users')
      .select('accuracy_score')
      .gt('accuracy_score', 0)
    
    const avgScore = avgAccuracy && avgAccuracy.length > 0 
      ? avgAccuracy.reduce((sum, user) => sum + (user.accuracy_score || 0), 0) / avgAccuracy.length
      : 0
    
    const maxStreak = leaderboard.length > 0 
      ? Math.max(...leaderboard.map(user => user.streak))
      : 0
    
    const stats = {
      totalPredictions: totalPredictions?.length || 0,
      activeUsers: activeUsers?.length || 0,
      avgAccuracy: Number(avgScore.toFixed(1)),
      maxStreak
    }
    
    return NextResponse.json({
      leaderboard,
      stats
    })
    
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}