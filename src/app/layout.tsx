import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'BoundaryTruth — Verified Boundary Inspection Evidence',
  description: 'Tamper-proof forest and plantation boundary inspection evidence infrastructure powered by Hedera Consensus Service.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
