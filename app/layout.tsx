import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PM Fitness Coach | Personal Trainer in Ramgarh, Jharkhand',
  description: 'PM Fitness Coach by Pappu Kumar – personalized fitness training, fat loss, muscle gain, strength training and nutrition guidance in Ramgarh, Jharkhand.',
  generator: 'v0.app',
  openGraph: {
    title: 'PM Fitness Coach | Pappu Kumar',
    description: 'Train Smart. Get Strong. Transform Yourself.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5efe7',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-[#f5efe7]"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
