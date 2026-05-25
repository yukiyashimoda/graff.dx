import HeroSceneLoader from './components/three/HeroSceneLoader'
import TopNavBar from './components/TopNavBar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import WorksSection from './components/WorksSection'
import CarouselSection from './components/CarouselSection'
import NewsSection from './components/NewsSection'
import ContactSection from './components/ContactSection'
import SiteFooter from './components/SiteFooter'

export default function Home() {
  return (
    <>
      {/* Three.js: ヒーロー背景として固定 */}
      <div className="fixed inset-0 z-0 opacity-70">
        <HeroSceneLoader />
      </div>

      <TopNavBar />

      <main>
        <HeroSection />
        <div className="relative z-10 bg-background">
          <AboutSection />
          <WorksSection />
          <CarouselSection />
          <NewsSection />
          <ContactSection />
          <SiteFooter />
        </div>
      </main>
    </>
  )
}
