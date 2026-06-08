import Hero from './components/home/hero'
import AboutSection from './components/home/about-section'
import SpacesGrid from './components/home/spaces-grid'
import FeaturesSection from './components/home/features-section'
import CTASection from './components/home/cta-section'
import { GallerySection } from './components/home/gallery-section'

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <SpacesGrid />
      <FeaturesSection />
      <GallerySection/>
      <CTASection />
    </>
  )
}