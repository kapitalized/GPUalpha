import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { logger } from '../../../lib/utils/logger'
import { gpuIdQuerySchema, priceRoutePostSchema } from '../../../lib/validation/schemas'
import { validateQuery, validateBody } from '../../../lib/validation/middleware'
import { rateLimiters } from '../../../lib/middleware/rateLimit'
import { sizeLimiters } from '../../../lib/middleware/requestSizeLimit'

export async function GET(request: Request) {
  // Rate limiting
  const rateLimitResponse = rateLimiters.public(request)
  if (rateLimitResponse) return rateLimitResponse
  const { searchParams } = new URL(request.url)
  
  // Validate query parameters
  const validation = validateQuery(gpuIdQuerySchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { id: gpuId } = validation.data
  
  try {
    if (gpuId) {
      // Return specific GPU with price history
      const { data: gpu, error: gpuError } = await supabase
        .from('gpus')
        .select(`
          *,
          price_history (
            price,
            recorded_at,
            source
          )
        `)
        .eq('id', gpuId)
        .single()
      
      if (gpuError) throw gpuError
      if (!gpu) {
        return NextResponse.json({ error: 'GPU not found' }, { status: 404 })
      }
      
      return NextResponse.json(gpu, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      })
    } else {
      // Return all GPUs with latest price data
      const { data: gpus, error } = await supabase
        .from('gpus')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return NextResponse.json(gpus, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      })
    }
  } catch (error: any) {
    logger.error('Database error fetching GPU data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch GPU data',
        details: error?.message || 'Unknown error',
        hint: error?.code === '42P01' ? 'Database table "gpus" does not exist. Please run the SQL schema migration.' : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // Request size limit (check before rate limiting to save quota)
  const sizeLimitResponse = await sizeLimiters.standard(request)
  if (sizeLimitResponse) return sizeLimitResponse
  
  // Rate limiting (stricter for POST)
  const rateLimitResponse = rateLimiters.strict(request)
  if (rateLimitResponse) return rateLimitResponse
  
  // Validate request body
  const validation = await validateBody(priceRoutePostSchema, request)
  if (!validation.success) {
    return validation.response
  }
  
  const body = validation.data
  
  try {
    if (body.type === 'price_update') {
      const { gpu_id, price, source } = body
      
      // Update current price in gpus table
      const { error: updateError } = await supabase
        .from('gpus')
        .update({ 
          current_price: price, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', gpu_id)
      
      if (updateError) throw updateError
      
      // Add to price history
      const { error: historyError } = await supabase
        .from('price_history')
        .insert({
          gpu_id,
          price,
          source
        })
      
      if (historyError) throw historyError
      
      return NextResponse.json({ success: true, message: 'Price updated' })
    }
    
    if (body.type === 'new_gpu') {
      const { data, error } = await supabase
        .from('gpus')
        .insert(body.gpu_data)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, gpu: data })
    }
    
    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    
  } catch (error) {
    logger.error('Database error processing request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}