import { NextResponse } from 'next/server'
import { ScraperManager } from '../../../../lib/scrapers/scraper-manager'

// This will be called by cron job or manually to update prices
export async function POST(request: Request) {
  try {
    // Optional: Add authentication for this endpoint
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting manual price update...')
    
    const scraperManager = new ScraperManager()
    const results = await scraperManager.scrapeAllGPUs()
    
    // Calculate summary statistics
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    const summary = {
      totalGPUs: results.length,
      successful: successful.length,
      failed: failed.length,
      totalDataPoints: successful.reduce((sum, r) => sum + r.dataPoints, 0),
      errors: failed.map(r => ({ gpu: `${r.brand} ${r.model}`, error: r.error }))
    }
    
    console.log('Price update completed:', summary)
    
    return NextResponse.json({
      success: true,
      summary,
      results: successful.map(r => ({
        gpu: `${r.brand} ${r.model}`,
        dataPoints: r.dataPoints,
        lowestPrice: r.lowestPrice,
        averagePrice: r.averagePrice
      }))
    })
    
  } catch (error) {
    console.error('Error updating prices:', error)
    return NextResponse.json(
      { error: 'Failed to update prices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check scraper status
export async function GET() {
  try {
    const scraperManager = new ScraperManager()
    const status = scraperManager.getStatus()
    
    return NextResponse.json({
      ...status,
      lastUpdate: new Date().toISOString(),
      availableScrapers: ['PCPartPicker'] // Will expand as you add more
    })
    
  } catch (error) {
    console.error('Error checking scraper status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}