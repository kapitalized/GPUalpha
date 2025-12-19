import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '../lib/contexts/AuthContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://gpualpha.com'),
  title: {
    default: 'GPUAlpha - GPU Compute Price Index',
    template: '%s | GPUAlpha'
  },
  description: 'Track real-time GPU compute prices, market trends, and price indices. Comprehensive data on NVIDIA, AMD GPUs, spot prices, and compute availability.',
  keywords: [
    'GPU prices',
    'compute index',
    'GPU market',
    'NVIDIA prices',
    'AMD prices',
    'GPU spot prices',
    'GPU analytics',
    'GPU price tracker',
    'graphics card prices',
    'GPU market intelligence',
    'compute pricing',
    'GPU price history'
  ],
  authors: [{ name: 'GPUAlpha' }],
  creator: 'GPUAlpha',
  publisher: 'GPUAlpha',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gpualpha.com',
    siteName: 'GPUAlpha',
    title: 'GPUAlpha - GPU Compute Price Index',
    description: 'Track real-time GPU compute prices, market trends, and price indices. Comprehensive data on NVIDIA, AMD GPUs, spot prices, and compute availability.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GPUAlpha - GPU Compute Price Index',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPUAlpha - GPU Compute Price Index',
    description: 'Track real-time GPU compute prices, market trends, and price indices.',
    images: ['/og-image.png'],
    creator: '@gpualpha'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add when you have verification codes
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://gpualpha.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}