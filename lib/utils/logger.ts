/**
 * Centralized logging utility
 * Uses environment-based logging levels
 * Sends errors to Sentry in production
 */

import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const getLogLevel = (): LogLevel => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  }
  // Client-side
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
}

const shouldLog = (level: LogLevel): boolean => {
  const currentLevel = getLogLevel()
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.debug('[DEBUG]', ...args)
    }
  },

  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  },

  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  },

  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args)
      
      // Send to Sentry in production
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        try {
          // Capture exception if first arg is an Error
          if (args[0] instanceof Error) {
            Sentry.captureException(args[0], {
              extra: {
                additionalArgs: args.slice(1).map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ),
              },
            })
          } else {
            // Capture message for non-Error objects
            Sentry.captureMessage(`Error: ${args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ')}`, {
              level: 'error',
            })
          }
        } catch (sentryError) {
          // Don't let Sentry errors break the app
          console.error('Failed to send error to Sentry:', sentryError)
        }
      }
    }
  },
}

