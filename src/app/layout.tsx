import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🤖 Hälsocoach',
  description: 'Din personliga AI-assistent för hälsosam kost',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 