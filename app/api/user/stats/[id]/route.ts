import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get user's predictions with GPU details
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select(`
        *,
        gpus (
          model,
          brand,
          current_price,
          msrp
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (predictionsError) throw predictionsError

    // Calculate stats
    const totalPredictions = predictions?.length || 0
    const resolvedPredictions = predictions?.filter(p => p.is_resolved) || []
    const pendingPredictions = predictions?.filter(p => !p.is_resolved) || []
    
    const averageAccuracy = resolvedPredictions.length > 0
      ? resolvedPredictions.reduce((sum, p) => sum + (p.accuracy_score || 0), 0) / resolvedPredictions.length
      : 0

    const totalPointsEarned = predictions?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0

    // Get accuracy over time (last 10 predictions)
    const recentPredictions = resolvedPredictions.slice(0, 10).reverse()
    const accuracyHistory = recentPredictions.map((p, index) => ({
      predictionNumber: index + 1,
      accuracy: p.accuracy_score || 0,
      date: p.created_at,
      gpu: `${p.gpus.brand} ${p.gpus.model}`
    }))

    // Get user's rank
    const { data: allUsers, error: rankError } = await supabase
      .from('users')
      .select('id, points')
      .order('points', { ascending: false })

    if (rankError) throw rankError

    const userRank = allUsers?.findIndex(u => u.id === userId) + 1 || 0

    // Get prediction distribution by timeframe
    const timeframeStats = {
      '7d': predictions?.filter(p => p.timeframe === '7d').length || 0,
      '30d': predictions?.filter(p => p.timeframe === '30d').length || 0,
      '90d': predictions?.filter(p => p.timeframe === '90d').length || 0
    }

    // Get recent activity (last 5 predictions)
    const recentActivity = predictions?.slice(0, 5).map(p => ({
      id: p.id,
      gpu: `${p.gpus.brand} ${p.gpus.model}`,
      predictedPrice: p.predicted_price,
      currentPrice: p.gpus.current_price,
      timeframe: p.timeframe,
      confidence: p.confidence,
      created_at: p.created_at,
      is_resolved: p.is_resolved,
      accuracy_score: p.accuracy_score,
      points_earned: p.points_earned
    })) || []

    const stats = {
      user: {
        ...user,
        rank: userRank
      },
      overview: {
        totalPredictions,
        resolvedPredictions: resolvedPredictions.length,
        pendingPredictions: pendingPredictions.length,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        totalPoints: user.points,
        totalPointsEarned,
        currentStreak: user.prediction_streak
      },
      accuracyHistory,
      timeframeStats,
      recentActivity
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}