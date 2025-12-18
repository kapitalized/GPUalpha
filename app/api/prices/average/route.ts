import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

/**
 * Get average price over a time period (optimized for Asian-style settlement)
 * Uses TimescaleDB's get_price_average function for fast calculations
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gpuId = searchParams.get('gpu_id')
  const days = parseInt(searchParams.get('days') || '7')
  
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
    const { data: avgPrice, error: functionError } = await supabase
      .rpc('get_price_average', {
        p_gpu_id: gpuId,
        p_start_time: startTime.toISOString(),
        p_end_time: endTime.toISOString()
      })

    if (!functionError && avgPrice !== null) {
      return NextResponse.json({
        gpu_id: gpuId,
        average_price: parseFloat(avgPrice),
        period_days: days,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      })
    }

    // Option 2: Fallback to standard query
    const { data: priceHistory, error } = await supabase
      .from('price_history')
      .select('price')
      .eq('gpu_id', gpuId)
      .gte('recorded_at', startTime.toISOString())
      .lte('recorded_at', endTime.toISOString())

    if (error) throw error

    if (!priceHistory || priceHistory.length === 0) {
      return NextResponse.json(
        { error: 'No price data found for this period' },
        { status: 404 }
      )
    }

    const average = priceHistory.reduce((sum: number, h: { price: number | string }) => sum + parseFloat(String(h.price)), 0) / priceHistory.length

    return NextResponse.json({
      gpu_id: gpuId,
      average_price: Math.round(average * 100) / 100,
      period_days: days,
      data_points: priceHistory.length,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    })
    
  } catch (error: any) {
    console.error('Error calculating average price:', error)
    return NextResponse.json(
      { 
        error: 'Failed to calculate average price',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

