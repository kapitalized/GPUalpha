/*
 * File: app/api/user/stats/[id]/route.ts
 * Function: Get user stats with error handling for missing users
 */

import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { logger } from '../../../../../lib/utils/logger'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    logger.debug('Fetching stats for user ID:', userId)

    // First, check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      logger.error('User lookup error:', userError)
      if (userError.code === 'PGRST116') {
        // User not found
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      throw userError
    }

    logger.debug('Found user:', user.username || user.email)

    // Get user's predictions with GPU details (with error handling)
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

    if (predictionsError) {
      logger.error('Predictions error:', predictionsError)
      // Don't fail completely, just return empty predictions
    }

    const safePredicitions = predictions || []

    // Calculate stats safely
    const totalPredictions = safePredicitions.length
    const resolvedPredictions = safePredicitions.filter((p: any) => p.is_resolved) || []
    const pendingPredictions = safePredicitions.filter((p: any) => !p.is_resolved) || []
    
    const averageAccuracy = resolvedPredictions.length > 0
      ? resolvedPredictions.reduce((sum: number, p: any) => sum + (p.accuracy_score || 0), 0) / resolvedPredictions.length
      : 0

    const totalPointsEarned = safePredicitions.reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0)

    // Get accuracy over time (last 10 predictions)
    const recentPredictions = resolvedPredictions.slice(0, 10).reverse()
    const accuracyHistory = recentPredictions.map((p: any, index: number) => ({
      predictionNumber: index + 1,
      accuracy: p.accuracy_score || 0,
      date: p.created_at,
      gpu: p.gpus ? `${p.gpus.brand} ${p.gpus.model}` : 'Unknown GPU'
    }))

    // Get user's rank (simplified)
    const { data: allUsers, error: rankError } = await supabase
      .from('users')
      .select('id, points')
      .order('points', { ascending: false })

    let userRank = 0
    if (!rankError && allUsers) {
      userRank = allUsers.findIndex((u: any) => u.id === userId) + 1
    }

    // Get prediction distribution by timeframe
    const timeframeStats = {
      '7d': safePredicitions.filter((p: any) => p.timeframe === '7d').length,
      '30d': safePredicitions.filter((p: any) => p.timeframe === '30d').length,
      '90d': safePredicitions.filter((p: any) => p.timeframe === '90d').length
    }

    // Get recent activity (last 5 predictions)
    const recentActivity = safePredicitions.slice(0, 5).map((p: any) => ({
      id: p.id,
      gpu: p.gpus ? `${p.gpus.brand} ${p.gpus.model}` : 'Unknown GPU',
      predictedPrice: p.predicted_price,
      currentPrice: p.gpus?.current_price || 0,
      timeframe: p.timeframe,
      confidence: p.confidence,
      created_at: p.created_at,
      is_resolved: p.is_resolved,
      accuracy_score: p.accuracy_score,
      points_earned: p.points_earned
    }))

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
        totalPoints: user.points || 0,
        totalPointsEarned,
        currentStreak: user.prediction_streak || 0
      },
      accuracyHistory,
      timeframeStats,
      recentActivity
    }

    logger.debug('Returning stats for user:', user.username || user.email)
    return NextResponse.json(stats)

  } catch (error) {
    logger.error('Detailed error in user stats API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user stats',
        details: error instanceof Error ? error.message : 'Unknown error',
        userId: params.id
      },
      { status: 500 }
    )
  }
}