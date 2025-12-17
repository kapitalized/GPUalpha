import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  
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
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: predictions, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, gpu_id, predicted_price, timeframe, confidence, reasoning } = body
    
    // Validate required fields (user_id is optional for anonymous predictions)
    if (!gpu_id || !predicted_price || !timeframe || !confidence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Use anonymous user ID if not provided
    const finalUserId = user_id || '00000000-0000-0000-0000-000000000000'
    
    // Insert prediction
    const { data: prediction, error } = await supabase
      .from('predictions')
      .insert({
        user_id: finalUserId,
        gpu_id,
        predicted_price: parseFloat(predicted_price),
        timeframe,
        confidence: parseInt(confidence),
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
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    )
  }
}