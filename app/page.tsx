'use client'

import { useEffect, useState } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import MixamoCharacterCanvas from './components/MixamoCharacterV2'
import CustomCursor from './components/CustomCursor'
import Preloader from './components/Preloader'
import HeroSection from './sections/HeroSection'
import AboutSection from './sections/AboutSection'
import CurriculumSection from './sections/CurriculumSection'
import MentorsSection from './sections/MentorsSection'
import ShowcaseSection from './sections/ShowcaseSection'
import FooterSection from './sections/FooterSection'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [modelLoaded, setModelLoaded] = useState(false)

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Cleanup
    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [])

  const handlePreloaderComplete = () => {
    setIsLoading(false)
    // Refresh ScrollTrigger after content is visible
    ScrollTrigger.refresh()
  }

  const handleModelLoaded = () => {
    console.log('[Page] 3D Model loaded!')
    setModelLoaded(true)
  }

  return (
    <>
      {/* Preloader - waits for both animation and 3D model */}
      {isLoading && <Preloader onComplete={handlePreloaderComplete} modelLoaded={modelLoaded} />}
      
      <main className="relative">
        {/* Custom Cursor */}
        <CustomCursor />

        {/* WebGL Background - 3D Character with Mixamo animations */}
        <MixamoCharacterCanvas onModelLoaded={handleModelLoaded} />

        {/* Scan line effect */}
        <div className="scan-line" />

        {/* Page Sections */}
        <div className="relative z-10">
          <HeroSection />
          <AboutSection />
          <CurriculumSection />
          <MentorsSection />
          <ShowcaseSection />
          <FooterSection />
        </div>

        {/* Fixed Logo */}
        <div className="fixed top-6 left-6 z-50 mix-blend-difference">
          <span className="font-bold text-lg text-srg-white tracking-tighter">
            SR<span className="inline-block transform scale-x-[-1]">G</span>
          </span>
        </div>

        {/* Fixed Menu */}
        <nav className="fixed top-6 right-6 z-50 mix-blend-difference">
          <button 
            data-cursor-hover
            className="font-mono text-xs text-srg-white hover:text-srg-accent transition-colors"
          >
            <span className="block">[MENU]</span>
          </button>
        </nav>

        {/* Progress indicator */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-2">
          {['Hero', 'About', 'Curriculum', 'Mentors', 'Showcase', 'Enroll'].map((label, i) => (
            <div 
              key={label}
              className="w-1 h-8 bg-srg-gray/30 hover:bg-srg-accent/50 transition-colors cursor-pointer"
              data-cursor-hover
              title={label}
            />
          ))}
        </div>
      </main>
    </>
  )
}
