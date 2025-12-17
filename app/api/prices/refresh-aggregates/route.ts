import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

/**
 * Refresh materialized views for price aggregates
 * Call this periodically (e.g., via cron job) to keep aggregates up to date
 * 
 * Note: This requires service role key for database functions
 */
export async function POST(request: Request) {
  try {
    // Verify authorization (optional - add your own auth logic)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'gpu-alpha-refresh-secret'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Refresh materialized views
    const { error } = await supabase.rpc('refresh_price_aggregates')

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

