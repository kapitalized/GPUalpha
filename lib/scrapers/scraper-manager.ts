import { BaseScraper, ScrapedGPUData } from './base-scraper'
import { PCPartPickerScraper } from './pcpartpicker-scraper'
import { supabase } from '../supabase'

export interface ScrapingResult {
  success: boolean
  gpuId: string
  model: string
  brand: string
  dataPoints: number
  lowestPrice?: number
  averagePrice?: number
  error?: string
}

export class ScraperManager {
  private scrapers: BaseScraper[] = []
  private isRunning = false

  constructor() {
    // Register all scrapers
    this.registerScraper(new PCPartPickerScraper())
    // Future scrapers will be added here:
    // this.registerScraper(new NeweggScraper())
    // this.registerScraper(new BestBuyScraper())
  }

  private registerScraper(scraper: BaseScraper): void {
    this.scrapers.push(scraper)
    console.log(`Registered scraper: ${scraper.getName()}`)
  }

  async scrapeAllGPUs(): Promise<ScrapingResult[]> {
    if (this.isRunning) {
      throw new Error('Scraping is already in progress')
    }

    this.isRunning = true
    const results: ScrapingResult[] = []

    try {
      console.log('Starting GPU price scraping...')
      
      // Get all GPUs from database
      const { data: gpus, error } = await supabase
        .from('gpus')
        .select('id, model, brand')
      
      if (error) throw error
      if (!gpus || gpus.length === 0) {
        console.log('No GPUs found in database')
        return results
      }

      console.log(`Found ${gpus.length} GPUs to scrape`)

      // Scrape each GPU across all scrapers
      for (const gpu of gpus) {
        const result = await this.scrapeGPU(gpu.id, gpu.model, gpu.brand)
        results.push(result)
        
        // Add delay between GPUs to be respectful to websites
        await this.delay(2000)
      }

      console.log(`Scraping completed. ${results.length} GPUs processed.`)
      return results

    } catch (error) {
      console.error('Error in scrapeAllGPUs:', error)
      throw error
    } finally {
      this.isRunning = false
      await this.cleanup()
    }
  }

  private async scrapeGPU(gpuId: string, model: string, brand: string): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      gpuId,
      model,
      brand,
      dataPoints: 0
    }

    try {
      console.log(`Scraping prices for ${brand} ${model}...`)
      
      const allScrapedData: ScrapedGPUData[] = []

      // Run all scrapers for this GPU
      for (const scraper of this.scrapers) {
        try {
          console.log(`  Using ${scraper.getName()}...`)
          const scraperData = await scraper.scrapeGPU(model, brand)
          allScrapedData.push(...scraperData)
          console.log(`  Found ${scraperData.length} price points`)
        } catch (error) {
          console.error(`  Error with ${scraper.getName()}:`, error)
          // Continue with other scrapers
        }
      }

      if (allScrapedData.length === 0) {
        result.error = 'No price data found'
        return result
      }

      // Calculate price statistics
      const prices = allScrapedData.map(item => item.price).filter(price => price > 0)
      const lowestPrice = Math.min(...prices)
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

      // Update GPU current price with lowest found price
      await this.updateGPUPrice(gpuId, lowestPrice)

      // Save price history
      await this.savePriceHistory(gpuId, allScrapedData)

      result.success = true
      result.dataPoints = allScrapedData.length
      result.lowestPrice = lowestPrice
      result.averagePrice = averagePrice

      console.log(`  Success: ${allScrapedData.length} data points, lowest: $${lowestPrice}`)
      
      return result

    } catch (error) {
      console.error(`Error scraping ${brand} ${model}:`, error)
      result.error = error instanceof Error ? error.message : 'Unknown error'
      return result
    }
  }

  private async updateGPUPrice(gpuId: string, newPrice: number): Promise<void> {
    const { error } = await supabase
      .from('gpus')
      .update({ 
        current_price: newPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', gpuId)
    
    if (error) throw error
  }

  private async savePriceHistory(gpuId: string, scrapedData: ScrapedGPUData[]): Promise<void> {
    const priceHistoryEntries = scrapedData
      .filter(item => item.price > 0)
      .map(item => ({
        gpu_id: gpuId,
        price: item.price,
        source: `${item.source} - ${item.retailer || 'Unknown'}`,
        recorded_at: item.scrapedAt.toISOString()
      }))

    if (priceHistoryEntries.length === 0) return

    const { error } = await supabase
      .from('price_history')
      .insert(priceHistoryEntries)
    
    if (error) throw error
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async cleanup(): Promise<void> {
    console.log('Cleaning up scrapers...')
    for (const scraper of this.scrapers) {
      try {
        await scraper.close()
      } catch (error) {
        console.error(`Error closing scraper ${scraper.getName()}:`, error)
      }
    }
  }

  // Get scraping status
  getStatus(): { isRunning: boolean; scraperCount: number } {
    return {
      isRunning: this.isRunning,
      scraperCount: this.scrapers.length
    }
  }

  // Add new scraper dynamically
  addScraper(scraper: BaseScraper): void {
    this.registerScraper(scraper)
  }
}