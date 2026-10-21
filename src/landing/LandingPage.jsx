import { useEffect } from 'react'
import css from '../styles/landing.css?inline'
import extras from '../styles/extras.css?inline'
import useScopedStyles from '../hooks/useScopedStyles'
import Nav from './Nav'
import Hero from './sections/Hero'
import SignalStrip from './sections/SignalStrip'
import Story from './sections/Story'
import Pillars from './sections/Pillars'
import Product from './sections/Product'
import Why from './sections/Why'
import UseCases from './sections/UseCases'
import MarqueeBand from './sections/MarqueeBand'
import Testimonials from './sections/Testimonials'
import Principle from './sections/Principle'
import Process from './sections/Process'
import Pricing from './sections/Pricing'
import Faq from './sections/Faq'
import FinalCta from './sections/FinalCta'
import Footer from './sections/Footer'

export default function LandingPage() {
  useScopedStyles(css + extras, 'landing')
  useEffect(() => { document.title = 'Dablo — Make the money behind your content make sense' }, [])
  return (
    <>
      <Nav />
      <Hero />
      <SignalStrip />
      <Story />
      <Pillars />
      <Product />
      <Why />
      <UseCases />
      <MarqueeBand />
      <Testimonials />
      <Principle />
      <Process />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  )
}
