import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

/**
 * Get price statistics over a time period
 * Uses TimescaleDB's get_price_stats function for comprehensive analytics
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gpuId = searchParams.get('gpu_id')
  const days = parseInt(searchParams.get('days') || '30')
  
  try {
    if (!gpuId) {
      return NextResponse.json(
        { error: 'gpu_id parameter is required' },
        { status: 400 }
      )
    }

    const endTime = new Date()
    const startTime = new Date()
    startTime.setDate(startTime.getDate() - days)

    // Option 1: Use TimescaleDB helper function (if available)
    const { data: stats, error: functionError } = await supabase
      .rpc('get_price_stats', {
        p_gpu_id: gpuId,
        p_start_time: startTime.toISOString(),
        p_end_time: endTime.toISOString()
      })

    if (!functionError && stats && stats.length > 0) {
      return NextResponse.json({
        gpu_id: gpuId,
        period_days: days,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        ...stats[0]
      })
    }

    // Option 2: Fallback to standard query
    const { data: priceHistory, error } = await supabase
      .from('price_history')
      .select('price')
      .eq('gpu_id', gpuId)
      .gte('recorded_at', startTime.toISOString())
      .lte('recorded_at', endTime.toISOString())
      .order('recorded_at', { ascending: true })

    if (error) throw error

    if (!priceHistory || priceHistory.length === 0) {
      return NextResponse.json(
        { error: 'No price data found for this period' },
        { status: 404 }
      )
    }

    const prices = priceHistory.map((h: { price: number | string }) => parseFloat(String(h.price)))
    const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const priceChange = max - min
    const priceChangePercent = min > 0 ? (priceChange / min) * 100 : 0

    return NextResponse.json({
      gpu_id: gpuId,
      period_days: days,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      avg_price: Math.round(avg * 100) / 100,
      min_price: min,
      max_price: max,
      price_change: Math.round(priceChange * 100) / 100,
      price_change_percent: Math.round(priceChangePercent * 100) / 100,
      data_points: priceHistory.length
    })
    
  } catch (error: any) {
    console.error('Error fetching price statistics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch price statistics',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

