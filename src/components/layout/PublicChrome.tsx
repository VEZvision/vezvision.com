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
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
