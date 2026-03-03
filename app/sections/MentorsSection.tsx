'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DistortionImage from '../components/DistortionImage'

gsap.registerPlugin(ScrollTrigger)

const mentors = [
  {
    name: 'ALEXANDER VASILYEV',
    role: 'Creative Director',
    company: 'AVA Digital',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
    expertise: ['Brand Strategy', 'Art Direction', 'Motion Design'],
    social: '@vasilyev'
  },
  {
    name: 'MARIA SOKOLOVA',
    role: 'Lead Developer',
    company: 'AVA Digital',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    expertise: ['WebGL', 'React', 'Performance'],
    social: '@sokolova'
  },
  {
    name: 'DMITRI KUZNETSOV',
    role: '3D Artist',
    company: 'Freelance',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop',
    expertise: ['Blender', 'Houdini', 'Shaders'],
    social: '@kuznetsov'
  },
  {
    name: 'ELENA PETROVA',
    role: 'UX Researcher',
    company: 'Yandex',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop',
    expertise: ['User Research', 'Testing', 'Accessibility'],
    social: '@petrova'
  }
]

export default function MentorsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const cards = cardsRef.current

    if (!section || !cards) return

    const cardElements = cards.querySelectorAll('.mentor-card')

    cardElements.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32 z-10"
    >
      {/* Section indicator */}
      <div className="absolute top-32 left-6 md:left-12 lg:left-24 font-mono text-xs text-srg-muted">
        <span className="text-srg-accent">03</span> — EXPÉRIENCE
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-24">
        <h2 className="text-display-sm font-bold mb-8">
          <span className="text-srg-white">MON PARCOURS</span>
          <br />
          <span className="text-stroke text-srg-accent">PROFESSIONNEL</span>
        </h2>
        <p className="font-mono text-srg-muted max-w-xl">
          Quatre années d'évolution chez l'Urssaf, de la première application Low-Code 
          aux architectures cloud-native de haute disponibilité.
        </p>
      </div>

      {/* Mentors Grid */}
      <div 
        ref={cardsRef}
        className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {mentors.map((mentor) => (
          <div
            key={mentor.name}
            className="mentor-card group relative border border-srg-gray hover:border-srg-accent transition-all duration-500"
            data-cursor-hover
          >
            {/* Image with GLSL distortion */}
            <div className="aspect-[3/4] overflow-hidden bg-srg-dark">
              <DistortionImage 
                src={mentor.image} 
                alt={mentor.name}
                className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>

            {/* Info */}
            <div className="p-4 border-t border-srg-gray">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-srg-white text-sm group-hover:text-srg-accent transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="font-mono text-xs text-srg-muted">
                    {mentor.role} @ {mentor.company}
                  </p>
                </div>
                <span className="font-mono text-xs text-srg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  {mentor.social}
                </span>
              </div>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {mentor.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-[10px] text-srg-muted border border-srg-gray px-1.5 py-0.5"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-srg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="max-w-7xl mx-auto mt-16 border-t border-srg-gray pt-8">
        <p className="font-mono text-xs text-srg-muted text-center">
          <span className="text-srg-accent">*</span> En alternance depuis 2021 à l'Urssaf Caisse nationale avec progression continue
        </p>
      </div>
    </section>
  )
}
