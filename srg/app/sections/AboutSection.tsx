'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const decorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const text = textRef.current
    const decor = decorRef.current

    if (!section || !text || !decor) return

    // Split text into words for animation
    const words = text.querySelectorAll('.word')

    gsap.set(words, { y: 60, opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'top 30%',
        toggleActions: 'play none none reverse'
      }
    })

    tl.to(words, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out'
    })

    gsap.to(decor, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'none'
    })

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

  const mainText = "Développeur Full-Stack avec plus de 4 ans à l'Urssaf Caisse nationale en alternance, progression de la Power Platform vers le Convertigo. Étudiant en première année de Mastère CTO & Tech Lead @ HETIC, en reconversion vers le leadership technique."

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-24 py-32 z-10"
    >
      {/* Section indicator */}
      <div className="absolute top-32 left-6 md:left-12 lg:left-24 font-mono text-xs text-srg-muted">
        <span className="text-srg-accent">01</span> — PROFIL
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Large statement */}
        <div ref={textRef} className="text-display-sm font-bold leading-tight mb-16">
          {mainText.split(' ').map((word, i) => (
            <span
              key={i}
              className={`word inline-block mr-4 ${
                word.includes('wow-effect') || word.includes('systematic')
                  ? 'text-srg-accent'
                  : 'text-srg-white'
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Secondary text */}
        <div className="grid md:grid-cols-2 gap-12 font-mono text-sm text-srg-muted">
          <div>
            <p className="mb-4">
              <span className="text-srg-accent">[EXPÉRIENCE]</span> — 
             Plus de 4 ans à l'Urssaf Caisse nationale en alternance, progression du Low-Code (Power Platform) 
             vers le Convertigo (Angular, TypeScript, Javascirpt, SQL, API).
            </p>
          </div>
          <div>
            <p className="mb-4">
              <span className="text-srg-accent">[FORMATION]</span> — 
              Mastère CTO & Tech Lead @ HETIC (2025-2027) et Bachelor CDA @ EFREI (2024-2025).
              Préparation aux rôles de leadership technique avec focus sur le system design et l'architecture.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '4+', label: 'ANS', sub: "Expérience à l'Urssaf" },
            { value: '3', label: 'ÉCOSYSTÈMES', sub: 'Maîtrise du Low-Code, Développement Fullstack & Systèmes Distribués' },
            { value: '100%', label: 'TECH LEAD', sub: 'Focus Architecture, System Design & Mentoring' },
            { value: '∞', label: 'APPRENDRE', sub: 'Toujours en Évolution' },
          ].map((stat, i) => (
            <div key={i} className="border-l-2 border-srg-accent pl-4">
              <div className="text-4xl md:text-5xl font-bold text-srg-white mb-1">
                {stat.value}
              </div>
              <div className="font-mono text-xs text-srg-accent tracking-wider">
                {stat.label}
              </div>
              <div className="font-mono text-xs text-srg-muted mt-1">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative rotating element */}
      <div 
        ref={decorRef}
        className="absolute bottom-32 right-12 md:right-24 text-srg-accent/20"
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="5"
              x2="100"
              y2="15"
              stroke="currentColor"
              strokeWidth="1"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </svg>
      </div>
    </section>
  )
}
