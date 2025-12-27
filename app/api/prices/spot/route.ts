import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { logger } from '../../../../lib/utils/logger'
import { spotPriceQuerySchema } from '../../../../lib/validation/schemas'
import { validateQuery } from '../../../../lib/validation/middleware'
import { rateLimiters } from '../../../../lib/middleware/rateLimit'

/**
 * Get latest spot price for a GPU (optimized with TimescaleDB)
 * Uses TimescaleDB's time-series optimizations for fast queries
 */
export async function GET(request: Request) {
  // Rate limiting
  const rateLimitResponse = rateLimiters.public(request)
  if (rateLimitResponse) return rateLimitResponse
  const { searchParams } = new URL(request.url)
  
  // Validate query parameters
  const validation = validateQuery(spotPriceQuerySchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { gpu_id: gpuId } = validation.data
  
  try {

    // Option 1: Use TimescaleDB helper function (if available)
    // This is faster as it uses optimized time-series queries
    const { data: latestPrice, error: functionError } = await supabase
      .rpc('get_latest_price', { p_gpu_id: gpuId })

    if (!functionError && latestPrice && latestPrice.length > 0) {
      return NextResponse.json({
        gpu_id: gpuId,
        spot_price: latestPrice[0].price,
        recorded_at: latestPrice[0].recorded_at,
        source: latestPrice[0].source
      })
    }

    // Option 2: Fallback to standard query (works with or without TimescaleDB)
    const { data: priceHistory, error } = await supabase
      .from('price_history')
      .select('price, recorded_at, source')
      .eq('gpu_id', gpuId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    if (!priceHistory) {
      return NextResponse.json(
        { error: 'No price history found for this GPU' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      gpu_id: gpuId,
      spot_price: priceHistory.price,
      recorded_at: priceHistory.recorded_at,
      source: priceHistory.source
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
    
  } catch (error: any) {
    logger.error('Error fetching spot price:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch spot price',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

