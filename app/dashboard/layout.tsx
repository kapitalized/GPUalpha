import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Dashboard',
  description: 'Your personal GPU price prediction dashboard. Track your accuracy, points, predictions, and performance over time.',
  robots: {
    index: false, // Don't index user dashboards
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'My Dashboard | GPUAlpha',
    description: 'Your personal GPU price prediction dashboard.',
    url: 'https://gpualpha.com/dashboard',
    type: 'website',
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

