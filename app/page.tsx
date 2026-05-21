import HeroSceneLoader from './components/three/HeroSceneLoader'
import TopNavBar from './components/TopNavBar'
import HeroSection from './components/HeroSection'
import WorksSection from './components/WorksSection'
import ServicesSection from './components/ServicesSection'
import NewsSection from './components/NewsSection'
import ContactSection from './components/ContactSection'
import SiteFooter from './components/SiteFooter'
import BottomNav from './components/BottomNav'

export default function Home() {
  return (
    <>
      {/* R3F canvas: ヒーローの背後に固定 */}
      <div className="fixed inset-0 z-0">
        <HeroSceneLoader />
      </div>

      <TopNavBar />

      <main>
        <HeroSection />
        {/* 以降のセクションは背景色でキャンバスを覆う */}
        <div className="relative z-10 bg-background">
          <WorksSection />
          <ServicesSection />
          <NewsSection />
          <ContactSection />
          <SiteFooter />
        </div>
      </main>

      <BottomNav />
    </>
  )
}
