import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { logger } from '../../../lib/utils/logger'
import { createPredictionSchema, predictionsQuerySchema } from '../../../lib/validation/schemas'
import { validateBody, validateQuery } from '../../../lib/validation/middleware'
import { rateLimiters } from '../../../lib/middleware/rateLimit'
import { sizeLimiters } from '../../../lib/middleware/requestSizeLimit'

export async function GET(request: Request) {
  // Rate limiting
  const rateLimitResponse = rateLimiters.public(request)
  if (rateLimitResponse) return rateLimitResponse
  const { searchParams } = new URL(request.url)
  
  // Validate query parameters
  const validation = validateQuery(predictionsQuerySchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { user_id } = validation.data
  
  try {
    let query = supabase
      .from('predictions')
      .select(`
        *,
        gpus (
          model,
          brand,
          current_price,
          msrp
        ),
        users (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (user_id) {
      query = query.eq('user_id', user_id)
    }
    
    const { data: predictions, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(predictions)
  } catch (error) {
    logger.error('Database error fetching predictions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // Request size limit (check before rate limiting to save quota)
  const sizeLimitResponse = await sizeLimiters.strict(request)
  if (sizeLimitResponse) return sizeLimitResponse
  
  // Rate limiting (stricter for POST)
  const rateLimitResponse = rateLimiters.strict(request)
  if (rateLimitResponse) return rateLimitResponse
  
  // Validate request body
  const validation = await validateBody(createPredictionSchema, request)
  if (!validation.success) {
    return validation.response
  }
  
  const { user_id, gpu_id, predicted_price, timeframe, confidence, reasoning } = validation.data
  
  try {
    // Use anonymous user ID if not provided
    const finalUserId = user_id || '00000000-0000-0000-0000-000000000000'
    
    // Insert prediction
    const { data: prediction, error } = await supabase
      .from('predictions')
      .insert({
        user_id: finalUserId,
        gpu_id,
        predicted_price,
        timeframe,
        confidence,
        reasoning: reasoning || null
      })
      .select(`
        *,
        gpus (
          model,
          brand,
          current_price
        )
      `)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      prediction 
    })
    
  } catch (error) {
    logger.error('Database error creating prediction:', error)
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    )
  }
}