import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Price History & Charts',
  description: 'View historical GPU price data with interactive charts. Track price trends over 7 days, 30 days, 90 days, or all-time. Analyze volatility and price movements.',
  keywords: [
    'GPU price history',
    'GPU price charts',
    'historical GPU prices',
    'price trends',
    'GPU price graphs',
    'price volatility',
    'GPU price analysis',
    'price movement tracking'
  ],
  openGraph: {
    title: 'GPU Price History & Charts | GPUAlpha - Historical Price Data',
    description: 'View historical GPU price data with interactive charts. Track price trends and analyze volatility.',
    url: 'https://gpualpha.com/history',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Price History & Charts | GPUAlpha',
    description: 'View historical GPU price data with interactive charts.',
  },
  alternates: {
    canonical: 'https://gpualpha.com/history',
  },
}

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

