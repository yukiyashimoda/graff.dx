import type { Metadata } from 'next'
import LegalRacingClient from './LegalRacingClient'

export const metadata: Metadata = {
  title: 'LEGAL RACING | graff',
  description: '走れ、ルールの範囲で。',
}

export default function LegalRacingPage() {
  return <LegalRacingClient />
}
