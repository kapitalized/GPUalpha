import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Market Analytics & Insights',
  description: 'Advanced GPU market analytics and insights. Index performance, brand distribution, price analysis, volatility metrics, and market trends for informed decision-making.',
  keywords: [
    'GPU analytics',
    'market analytics',
    'GPU market insights',
    'price analytics',
    'market intelligence',
    'GPU market trends',
    'market metrics',
    'GPU statistics'
  ],
  openGraph: {
    title: 'GPU Market Analytics & Insights | GPUAlpha - Market Intelligence',
    description: 'Advanced GPU market analytics and insights. Index performance, brand distribution, and market trends.',
    url: 'https://gpualpha.com/analytics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Market Analytics & Insights | GPUAlpha',
    description: 'Advanced GPU market analytics and insights.',
  },
  alternates: {
    canonical: 'https://gpualpha.com/analytics',
  },
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

