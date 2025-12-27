import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Enabled in all environments for testing
  enabled: true,
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events if DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null
    }
    
    // Filter out sensitive information
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-api-key']
      }
      
      // Don't send request body (may contain sensitive data)
      if (event.request.data) {
        event.request.data = '[Filtered]'
      }
    }
    
    // Filter environment variables that might contain secrets
    if (event.extra) {
      const extra = event.extra
      Object.keys(extra).forEach(key => {
        if (key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('password') ||
            key.toLowerCase().includes('token')) {
          extra[key] = '[Filtered]'
        }
      })
    }
    
    return event
  },
  
  // Set sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
})

