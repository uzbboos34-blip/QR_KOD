import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QR Kod Generatori',
  description: 'Matn yoki rasm orqali QR kod yasang va tarixni saqlang',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  )
}
