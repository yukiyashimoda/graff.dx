import HeroSceneLoader from './components/three/HeroSceneLoader'
import LoadingScreen from './components/LoadingScreen'
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
      <LoadingScreen />

      {/* Three.js: ヒーロー背景として固定 */}
      <div
        className="fixed top-0 left-0 w-full z-0"
        style={{ height: '100svh', opacity: 0.7, willChange: 'transform', transform: 'translateZ(0)' }}
      >
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
