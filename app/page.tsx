export const dynamic = 'force-dynamic'

import LoadingScreen from './components/LoadingScreen'
import TopNavBar from './components/TopNavBar'
import StatementSection from './components/StatementSection'
import AppShowcaseSection from './components/AppShowcaseSection'
import NewsSection from './components/NewsSection'
import ContactSection from './components/ContactSection'
import SiteFooter from './components/SiteFooter'

export default function Home() {
  return (
    <div className="home-monochrome">
      <LoadingScreen />

      <TopNavBar />

      <main className="bg-background">
        <StatementSection />
        <AppShowcaseSection />
        <NewsSection />
        <ContactSection />
        <SiteFooter />
      </main>
    </div>
  )
}
