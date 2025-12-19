import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Overview - GPU Compute Price Index Platform',
  description: 'Comprehensive GPU compute price indexing platform. Track trends, spot prices, chip availability, and market insights for financial institutions, cloud providers, and AI companies.',
  keywords: [
    'GPU compute index',
    'GPU price tracker',
    'compute pricing',
    'GPU market intelligence',
    'GPU platform overview',
    'compute infrastructure pricing'
  ],
  openGraph: {
    title: 'GPU Compute Price Index Overview | GPUAlpha Platform',
    description: 'Comprehensive GPU compute price indexing platform. Track trends, spot prices, chip availability, and market insights.',
    url: 'https://gpualpha.com/overview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Compute Price Index Overview | GPUAlpha',
    description: 'Comprehensive GPU compute price indexing platform.',
  },
  alternates: {
    canonical: 'https://gpualpha.com/overview',
  },
}

export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

