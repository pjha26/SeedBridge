import { useScrollReveal } from '../hooks/useScrollReveal';
import Nav from '../components/landing/Nav';
import Hero from '../components/landing/Hero';
import TheGap from '../components/landing/TheGap';
import HowItWorks from '../components/landing/HowItWorks';
import TwoSides from '../components/landing/TwoSides';
import SampleListings from '../components/landing/SampleListings';
import StraightTalk from '../components/landing/StraightTalk';
import CallToAction from '../components/landing/CallToAction';
import Footer from '../components/landing/Footer';

export default function Home() {
  // Activates scroll-reveal on all [data-reveal] elements.
  // Only adds hidden starting state if IntersectionObserver is available
  // AND prefers-reduced-motion is off — so content is visible by default.
  useScrollReveal();

  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <TheGap />
        <HowItWorks />
        <TwoSides />
        <SampleListings />
        <StraightTalk />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
