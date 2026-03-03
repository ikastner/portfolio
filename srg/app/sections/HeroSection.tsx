'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Highlight } from '@/app/components/ui/hero-highlight'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const decorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const subtitle = subtitleRef.current
    const cta = ctaRef.current
    const decor = decorRef.current

    if (!section || !title || !subtitle || !cta || !decor) return

    // Initial states
    gsap.set(title, { y: 100, opacity: 0 })
    gsap.set(subtitle, { y: 50, opacity: 0 })
    gsap.set(cta, { y: 30, opacity: 0 })
    gsap.set(decor, { scale: 0, rotation: -180 })

    // Entry animation timeline
    const tl = gsap.timeline({ delay: 0.5 })

    tl.to(title, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power4.out'
    })
    .to(subtitle, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6')
    .to(cta, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4')
    .to(decor, {
      scale: 1,
      rotation: 0,
      duration: 1,
      ease: 'back.out(1.7)'
    }, '-=0.8')

    // Scroll animation
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    })

    scrollTl
      .to(title, { y: -200, opacity: 0.3, duration: 1 })
      .to(subtitle, { y: -100, opacity: 0.2, duration: 1 }, 0)
      .to(cta, { y: -50, opacity: 0, duration: 1 }, 0)

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 z-10"
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Decorative elements */}
      <div 
        ref={decorRef}
        className="absolute top-1/4 right-12 md:right-24 text-srg-accent opacity-20"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
          <text x="60" y="65" textAnchor="middle" fill="currentColor" fontSize="40" fontFamily="monospace">✌</text>
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl">
        {/* Top label */}
        <div className="mb-6 font-mono text-xs tracking-[0.3em] text-srg-muted uppercase">
          <span className="text-srg-accent">[</span> Développeur Full-Stack <span className="text-srg-accent">]</span>
        </div>

        {/* Main title */}
        <h1
          ref={titleRef}
          className="text-display font-bold leading-none tracking-tighter mb-8"
        >
          <span className="block glitch-text" data-text="IVANE">IVANE</span>
          <span className="block text-stroke text-srg-accent">KASTNER</span>
        </h1>

        {/* Subtitle */}
        <div ref={subtitleRef} className="max-w-2xl mb-12">
          <p className="text-xl md:text-2xl text-srg-muted leading-relaxed font-mono">
            De la{' '}
            <Highlight>
              <span className="text-srg-white">Rapidité</span>
            </Highlight>{' '}
            à la{' '}
            <span className="text-srg-accent">Robustesse</span> — Architecte de solutions scalables
          </p>
          <p className="mt-4 text-sm text-srg-muted font-mono tracking-wide">
            Mastère CTO & Tech Lead @ HETIC — Urssaf Caisse nationale
          </p>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-wrap gap-4">
          <button
            data-cursor-hover
            className="group relative px-8 py-4 bg-srg-accent text-srg-black font-bold text-sm tracking-wider uppercase overflow-hidden transition-all hover:scale-105"
          >
            <span className="relative z-10">Voir les Projets</span>
            <div className="absolute inset-0 bg-srg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
          
          <button
            data-cursor-hover
            className="px-8 py-4 border border-srg-muted text-srg-white font-mono text-sm tracking-wider uppercase hover:border-srg-accent hover:text-srg-accent transition-colors"
          >
            Télécharger CV
          </button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 flex justify-between items-end font-mono text-xs text-srg-muted">
        <div className="flex gap-8">
          <div>
            <span className="block text-srg-accent">LOCALISATION</span>
            <span>Montreuil, France</span>
          </div>
          <div>
            <span className="block text-srg-accent">DISPONIBILITÉ</span>
            <span>Ouvert aux opportunités</span>
          </div>
        </div>
        
        <div className="text-right">
          <span className="block text-srg-accent">DÉFILER</span>
          <span className="animate-pulse">↓</span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-srg-accent/30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-srg-accent/30" />
    </section>
  )
}
