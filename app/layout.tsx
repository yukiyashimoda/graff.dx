import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import SmoothScrollProvider from './components/SmoothScrollProvider'

const sora = localFont({
  src: [
    { path: './fonts/sora-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/sora-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/sora-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--ff-sora',
  display: 'swap',
})
const jetbrains = localFont({
  src: [
    { path: './fonts/jetbrains-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/jetbrains-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--ff-jetbrains',
  display: 'swap',
})
const hanken = localFont({
  src: [
    { path: './fonts/hanken-grotesk-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/hanken-grotesk-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--ff-hanken',
  display: 'swap',
})
const shareTech = localFont({
  src: [
    { path: './fonts/share-tech-latin-400-normal.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--ff-share-tech',
  display: 'swap',
})
const audiowide = localFont({
  src: [
    { path: './fonts/audiowide-latin-400-normal.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--ff-audiowide',
  display: 'swap',
})
const manrope = localFont({
  src: [
    { path: './fonts/manrope-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/manrope-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/manrope-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/manrope-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/manrope-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--ff-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'graff | Visualizing the Field',
  description: '現場の景色を、変える。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${sora.variable} ${jetbrains.variable} ${hanken.variable} ${shareTech.variable} ${audiowide.variable} ${manrope.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Analytics />
      </body>
    </html>
  )
}
