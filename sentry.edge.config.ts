import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 1.0,
  
  // Enabled in all environments for testing
  enabled: true,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
})

