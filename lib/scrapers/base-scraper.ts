import puppeteer, { Browser, Page } from 'puppeteer'

export interface ScrapedGPUData {
  model: string
  brand: string
  price: number
  availability: 'in_stock' | 'limited' | 'out_of_stock'
  source: string
  sourceUrl: string
  scrapedAt: Date
  retailer?: string
  sku?: string
}

export interface ScrapingConfig {
  headless: boolean
  timeout: number
  retries: number
  delay: number
  userAgent: string
}

export abstract class BaseScraper {
  protected config: ScrapingConfig
  protected browser: Browser | null = null

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = {
      headless: true,
      timeout: 30000,
      retries: 3,
      delay: 1000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ...config
    }
  }

  // Abstract methods that each scraper must implement
  abstract getName(): string
  abstract scrapeGPU(model: string, brand: string): Promise<ScrapedGPUData[]>

  // Shared browser management
  protected async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      })
    }
    return this.browser
  }

  protected async getPage(): Promise<Page> {
    const browser = await this.getBrowser()
    const page = await browser.newPage()
    
    await page.setUserAgent(this.config.userAgent)
    await page.setViewport({ width: 1920, height: 1080 })
    
    // Set reasonable timeouts
    await page.setDefaultTimeout(this.config.timeout)
    await page.setDefaultNavigationTimeout(this.config.timeout)
    
    return page
  }

  protected async delay(ms: number = this.config.delay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected async retry<T>(
    operation: () => Promise<T>, 
    retries: number = this.config.retries
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying operation, ${retries} attempts left`)
        await this.delay(2000) // Wait longer between retries
        return this.retry(operation, retries - 1)
      }
      throw error
    }
  }

  // Clean up resources
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  // Utility methods for data cleaning
  protected cleanPrice(priceText: string): number {
    const cleaned = priceText.replace(/[^0-9.]/g, '')
    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  }

  protected determineAvailability(text: string): 'in_stock' | 'limited' | 'out_of_stock' {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('out of stock') || 
        lowerText.includes('unavailable') || 
        lowerText.includes('sold out')) {
      return 'out_of_stock'
    }
    
    if (lowerText.includes('limited') || 
        lowerText.includes('low stock') || 
        lowerText.includes('few left')) {
      return 'limited'
    }
    
    return 'in_stock'
  }

  protected normalizeGPUModel(model: string): string {
    return model.trim()
      .replace(/\s+/g, ' ')
      .replace(/nvidia\s+/i, '')
      .replace(/amd\s+/i, '')
      .replace(/geforce\s+/i, '')
      .replace(/radeon\s+/i, '')
  }
}