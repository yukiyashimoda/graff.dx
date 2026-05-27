import type { Metadata } from 'next'
import { Sora, JetBrains_Mono, Hanken_Grotesk, Share_Tech } from 'next/font/google'
import './globals.css'
import SmoothScrollProvider from './components/SmoothScrollProvider'
import CustomCursor from './components/CustomCursor'

const sora      = Sora({ weight: ['400', '600', '700'], variable: '--ff-sora',       subsets: ['latin'], display: 'swap' })
const jetbrains = JetBrains_Mono({ weight: ['400', '500'],  variable: '--ff-jetbrains', subsets: ['latin'], display: 'swap' })
const hanken    = Hanken_Grotesk({ weight: ['400', '500'],  variable: '--ff-hanken',    subsets: ['latin'], display: 'swap' })
const shareTech = Share_Tech({ weight: '400',               variable: '--ff-share-tech', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'graff | Visualizing the Field',
  description: '現場の景色を、変える。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`dark ${sora.variable} ${jetbrains.variable} ${hanken.variable} ${shareTech.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body>
        <SmoothScrollProvider>
          <CustomCursor />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
