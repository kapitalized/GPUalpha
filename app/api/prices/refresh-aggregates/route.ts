import { NextResponse } from 'next/server'
import { supabaseServiceRole } from '../../../../lib/supabase'

/**
 * Refresh materialized views for price aggregates
 * Call this periodically (e.g., via cron job) to keep aggregates up to date
 * 
 * Note: This requires service role key for database functions
 */
export async function POST(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client for admin operations
    if (!supabaseServiceRole) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      )
    }

    // Refresh materialized views
    const { error } = await supabaseServiceRole.rpc('refresh_price_aggregates')

    if (error) {
      console.error('Error refreshing aggregates:', error)
      return NextResponse.json(
        { 
          error: 'Failed to refresh aggregates',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Materialized views refreshed successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Error in refresh aggregates:', error)
    return NextResponse.json(
      { 
        error: 'Failed to refresh aggregates',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

