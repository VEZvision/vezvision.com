import type { ReactNode } from 'react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import SEO from '@/components/seo/SEO'

interface PublicChromeProps {
  children: ReactNode
}

/** Shared shell for all public routes (nav, SEO, footer). */
export default function PublicChrome({ children }: PublicChromeProps) {
  return (
    <>
      <SEO />
      {/*
        Lenis event surface wraps the WHOLE page (nav + main + footer) so wheel
        events anywhere — including over the footer — are smoothed. If only <main>
        is the target, scrolling over the footer falls back to native scroll and
        fights Lenis, which causes the footer stutter.
      */}
      <div data-lenis-events>
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  )
}
