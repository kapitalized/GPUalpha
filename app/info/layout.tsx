import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Specifications & Information',
  description: 'Comprehensive GPU information database. Detailed specs, features, release dates, and use cases for NVIDIA and AMD graphics cards. Find the perfect GPU for your needs.',
  keywords: [
    'GPU specs',
    'GPU information',
    'NVIDIA specs',
    'AMD specs',
    'GPU database',
    'graphics card specs',
    'GPU specifications',
    'GPU features',
    'GPU use cases'
  ],
  openGraph: {
    title: 'GPU Specifications & Information | GPUAlpha - Complete GPU Database',
    description: 'Comprehensive GPU information database with detailed specs, features, and use cases for NVIDIA and AMD graphics cards.',
    url: 'https://gpualpha.com/info',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Specifications & Information | GPUAlpha',
    description: 'Comprehensive GPU information database with detailed specs and features.',
  },
  alternates: {
    canonical: 'https://gpualpha.com/info',
  },
}

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

