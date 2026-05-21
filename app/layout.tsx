import type { Metadata } from 'next'
import { Syne, JetBrains_Mono, Hanken_Grotesk, Playfair_Display } from 'next/font/google'
import './globals.css'

const syne = Syne({ weight: ['400', '700', '800'], variable: '--ff-syne', subsets: ['latin'], display: 'swap' })
const jetbrains = JetBrains_Mono({ weight: ['400', '500'], variable: '--ff-jetbrains', subsets: ['latin'], display: 'swap' })
const hanken = Hanken_Grotesk({ weight: ['400', '500'], variable: '--ff-hanken', subsets: ['latin'], display: 'swap' })
const playfair = Playfair_Display({ weight: ['400'], variable: '--ff-playfair', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'GRAFF. | Design Studio',
  description: 'graphic design / web design / planner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`dark ${syne.variable} ${jetbrains.variable} ${hanken.variable} ${playfair.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
