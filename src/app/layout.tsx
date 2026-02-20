import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cairn — Forest Boundary Intelligence',
  description: 'Blockchain-anchored forest boundary inspection and evidence management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
