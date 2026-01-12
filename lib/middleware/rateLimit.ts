import { NextResponse } from 'next/server'
import { logger } from '../utils/logger'

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis (Upstash) or Vercel Edge Config
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  identifier?: string // Custom identifier (defaults to IP)
}

/**
 * Get client identifier (IP address)
 */
function getIdentifier(request: Request): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback (won't work in serverless, but useful for local dev)
  return 'unknown'
}

/**
 * Rate limit middleware
 * Returns null if allowed, or NextResponse if rate limited
 */
export function rateLimit(
  request: Request,
  options: RateLimitOptions
): NextResponse | null {
  const { windowMs, maxRequests, identifier } = options
  
  const key = identifier || getIdentifier(request)
  const now = Date.now()
  
  // Get or create rate limit entry
  let entry = store[key]
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    store[key] = entry
    return null // Allowed
  }
  
  // Increment count
  entry.count++
  
  if (entry.count > maxRequests) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    logger.warn('Rate limit exceeded', {
      key,
      count: entry.count,
      maxRequests,
      retryAfter,
    })
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
        },
      }
    )
  }
  
  return null // Allowed
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // Public API: 60 requests per minute
  public: (request: Request) =>
    rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
    }),
  
  // Authenticated: 120 requests per minute
  authenticated: (request: Request) =>
    rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 120,
    }),
  
  // Price update endpoint: 10 requests per hour
  priceUpdate: (request: Request) =>
    rateLimit(request, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
    }),
  
  // Strict: 20 requests per minute
  strict: (request: Request) =>
    rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20,
    }),
}



