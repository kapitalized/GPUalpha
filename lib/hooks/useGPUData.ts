'use client'

import { useState, useEffect } from 'react'

export function useGPUData() {
  const [gpus, setGpus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGPUs = async () => {
      try {
        const response = await fetch('/api/prices')
        if (!response.ok) throw new Error('Failed to fetch GPU data')
        
        const data = await response.json()
        setGpus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchGPUs()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchGPUs, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { gpus, loading, error, refetch: () => setLoading(true) }
}
