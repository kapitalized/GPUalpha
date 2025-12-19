import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Price Prediction Leaderboard',
  description: 'See top GPU price predictors ranked by accuracy, points, and prediction streaks. Compete with the community to predict GPU price movements.',
  keywords: [
    'GPU prediction leaderboard',
    'price prediction',
    'prediction accuracy',
    'top predictors',
    'prediction rankings',
    'prediction competition'
  ],
  openGraph: {
    title: 'GPU Price Prediction Leaderboard | GPUAlpha - Top Predictors',
    description: 'See top GPU price predictors ranked by accuracy, points, and prediction streaks.',
    url: 'https://gpualpha.com/leaderboard',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Price Prediction Leaderboard | GPUAlpha',
    description: 'See top GPU price predictors ranked by accuracy and points.',
  },
  alternates: {
    canonical: 'https://gpualpha.com/leaderboard',
  },
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

