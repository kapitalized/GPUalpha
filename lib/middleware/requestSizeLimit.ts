import { NextResponse } from 'next/server'
import { logger } from '../utils/logger'

/**
 * Request size limit middleware
 * Prevents DoS attacks via large payloads
 */

export interface RequestSizeLimitOptions {
  maxSizeBytes: number // Maximum request body size in bytes
  errorMessage?: string // Custom error message
}

// Default limit: 1MB (reasonable for JSON APIs)
const DEFAULT_MAX_SIZE = 1024 * 1024 // 1MB

/**
 * Check request body size
 * Returns null if within limit, or NextResponse if too large
 */
export async function checkRequestSize(
  request: Request,
  options: RequestSizeLimitOptions = { maxSizeBytes: DEFAULT_MAX_SIZE }
): Promise<NextResponse | null> {
  const { maxSizeBytes, errorMessage } = options
  
  // Get Content-Length header
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    
    if (size > maxSizeBytes) {
      logger.warn('Request size limit exceeded', {
        size,
        maxSize: maxSizeBytes,
        url: request.url,
      })
      
      return NextResponse.json(
        {
          error: 'Payload too large',
          message: errorMessage || `Request body exceeds maximum size of ${formatBytes(maxSizeBytes)}`,
          maxSize: maxSizeBytes,
          receivedSize: size,
        },
        {
          status: 413, // Payload Too Large
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }
  
  // For requests without Content-Length, we'll check during body parsing
  // This is a fallback - Content-Length is preferred
  return null
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Pre-configured size limiters
 */
export const sizeLimiters = {
  // Standard: 1MB (for most API requests)
  standard: (request: Request) =>
    checkRequestSize(request, {
      maxSizeBytes: 1024 * 1024, // 1MB
      errorMessage: 'Request body exceeds maximum size of 1MB',
    }),
  
  // Strict: 100KB (for simple requests)
  strict: (request: Request) =>
    checkRequestSize(request, {
      maxSizeBytes: 100 * 1024, // 100KB
      errorMessage: 'Request body exceeds maximum size of 100KB',
    }),
  
  // Large: 5MB (for file uploads, if needed)
  large: (request: Request) =>
    checkRequestSize(request, {
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      errorMessage: 'Request body exceeds maximum size of 5MB',
    }),
  
  // Custom size
  custom: (request: Request, maxSizeBytes: number) =>
    checkRequestSize(request, {
      maxSizeBytes,
    }),
}


