import { BaseScraper, ScrapedGPUData } from './base-scraper'

export class PCPartPickerScraper extends BaseScraper {
  private baseUrl = 'https://pcpartpicker.com'

  getName(): string {
    return 'PCPartPicker'
  }

  async scrapeGPU(model: string, brand: string): Promise<ScrapedGPUData[]> {
    return this.retry(async () => {
      const page = await this.getPage()
      const results: ScrapedGPUData[] = []

      try {
        // Build search URL
        const searchQuery = `${brand} ${model}`.trim()
        const searchUrl = `${this.baseUrl}/products/video-card/#search=${encodeURIComponent(searchQuery)}`
        
        console.log(`Scraping PCPartPicker for: ${searchQuery}`)
        console.log(`URL: ${searchUrl}`)

        await page.goto(searchUrl, { waitUntil: 'networkidle2' })
        await this.delay(2000)

        // Wait for results to load
        try {
          await page.waitForSelector('.tr__product', { timeout: 10000 })
        } catch {
          console.log('No products found on page')
          return results
        }

        // Extract product data
        const products = await page.evaluate((model, brand) => {
          const productRows = document.querySelectorAll('.tr__product')
          const extractedProducts: any[] = []

          productRows.forEach((row, index) => {
            try {
              // Skip if too many results (first 10 should be most relevant)
              if (index >= 10) return

              const nameElement = row.querySelector('.td__name a')
              const priceElement = row.querySelector('.td__price')
              
              if (!nameElement || !priceElement) return

              const fullName = nameElement.textContent?.trim() || ''
              const priceText = priceElement.textContent?.trim() || ''

              // Filter for relevant GPUs
              const nameLower = fullName.toLowerCase()
              const modelLower = model.toLowerCase()
              const brandLower = brand.toLowerCase()

              // Check if this product matches our search
              if (nameLower.includes(modelLower) && nameLower.includes(brandLower)) {
                // Extract retailer info
                const retailerElement = row.querySelector('.td__availability a')
                const retailer = retailerElement?.textContent?.trim() || 'Unknown'
                
                // Get product URL
                const productUrl = nameElement.getAttribute('href') || ''

                extractedProducts.push({
                  fullName,
                  priceText,
                  retailer,
                  productUrl,
                  availability: 'in_stock' // PCPartPicker typically shows only available items
                })
              }
            } catch (error) {
              console.error('Error processing product row:', error)
            }
          })

          return extractedProducts
        }, model, brand)

        // Process extracted products
        for (const product of products) {
          const price = this.cleanPrice(product.priceText)
          
          if (price > 0) {
            results.push({
              model: this.normalizeGPUModel(model),
              brand: brand.toUpperCase(),
              price,
              availability: 'in_stock', // PCPartPicker shows available items
              source: this.getName(),
              sourceUrl: `${this.baseUrl}${product.productUrl}`,
              retailer: product.retailer,
              scrapedAt: new Date()
            })
          }
        }

        console.log(`Found ${results.length} results for ${brand} ${model}`)
        return results

      } catch (error) {
        console.error(`Error scraping PCPartPicker for ${brand} ${model}:`, error)
        throw error
      } finally {
        await page.close()
      }
    })
  }

  // Method to get the lowest price for a GPU
  async getLowestPrice(model: string, brand: string): Promise<ScrapedGPUData | null> {
    const results = await this.scrapeGPU(model, brand)
    
    if (results.length === 0) return null
    
    // Find the lowest price
    return results.reduce((lowest, current) => 
      current.price < lowest.price ? current : lowest
    )
  }

  // Method to get average price across retailers
  async getAveragePrice(model: string, brand: string): Promise<number> {
    const results = await this.scrapeGPU(model, brand)
    
    if (results.length === 0) return 0
    
    const totalPrice = results.reduce((sum, item) => sum + item.price, 0)
    return totalPrice / results.length
  }
}