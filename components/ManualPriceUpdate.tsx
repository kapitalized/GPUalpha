'use client'

import { useState } from 'react'

export function ManualPriceUpdate() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const updatePrices = async () => {
    setIsUpdating(true)
    try {
      // ⚠️ SECURITY WARNING: This component should NOT be used in production
      // The CRON_SECRET should never be exposed in client-side code
      // This is for development/testing only
      // In production, use cron jobs or server-side only endpoints
      const response = await fetch('/api/prices/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setLastUpdate(new Date().toLocaleString())
        alert(`Prices updated! ${result.updates?.length || 0} GPUs updated.`)
        
        // Refresh the page to show new prices
        window.location.reload()
      } else {
        throw new Error('Failed to update prices')
      }
    } catch (error) {
      alert('Error updating prices: ' + error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Price Updates</h3>
          <p className="text-slate-400 text-sm">
            {lastUpdate ? `Last updated: ${lastUpdate}` : 'Click to update GPU prices'}
          </p>
        </div>
        <button
          onClick={updatePrices}
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          {isUpdating ? 'Updating...' : 'Update Prices'}
        </button>
      </div>
    </div>
  )
}