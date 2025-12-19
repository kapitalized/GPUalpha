import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Price Predictions',
  description: 'Make and track GPU price predictions. Submit your forecasts for 7-day, 30-day, and 90-day timeframes. Earn points and compete on the leaderboard.',
  keywords: [
    'GPU predictions',
    'price predictions',
    'predict GPU prices',
    'forecast GPU prices',
    'price forecasting',
    'GPU price forecast'
  ],
  openGraph: {
    title: 'GPU Price Predictions | GPUAlpha - Make Your Predictions',
    description: 'Make and track GPU price predictions. Submit your forecasts and earn points.',
    url: 'https://gpualpha.com/predictions',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Price Predictions | GPUAlpha',
    description: 'Make and track GPU price predictions.',
  },
  alternates: {
    canonical: 'https://gpualpha.com/predictions',
  },
}

export default function PredictionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

