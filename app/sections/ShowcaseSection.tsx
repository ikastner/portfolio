'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    title: 'STORM',
    description: 'Backend de messagerie temps réel supportant 100K connexions simultanées et 500K messages/sec',
    tags: ['Go', 'Kubernetes', 'NATS', 'Terraform', 'Microservices'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    color: '#ff3d00'
  },
  {
    title: 'URSSAF MONITORING',
    description: 'Plateforme de monitoring centralisée remplaçant les workflows Excel critiques par des tableaux de bord temps réel',
    tags: ['Angular', '.NET', 'C#', 'Vue.js', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    color: '#00ffff'
  },
  {
    title: 'MOTEUR ORGANIGRAMME',
    description: 'Organigramme dynamique avec moteur de recherche complexe pour 20K+ utilisateurs',
    tags: ['Angular', 'TypeScript', 'PrimeNG', 'REST API'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    color: '#ff3d00'
  },
  {
    title: 'MIGRATION POWER PLATFORM',
    description: 'Migration stratégique de PowerApps vers Convertigo pour la souveraineté technique',
    tags: ['Power Platform', 'Convertigo', 'Ionic', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
    color: '#00ffff'
  }
]

const stats = [
  { name: 'CONNEXIONS', count: '100K', color: '#ff3d00' },
  { name: 'MESSAGES/SEC', count: '500K', color: '#00ffff' },
  { name: 'UTILISATEURS', count: '20K+', color: '#ff3d00' },
  { name: 'ANS EXP', count: '4+', color: '#00ffff' }
]

export default function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const projectsContainer = projectsRef.current

    if (!section || !projectsContainer) return

    const cards = projectsContainer.querySelectorAll('.project-card')

    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 100, opacity: 0, rotateY: -15 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 1,
          delay: i * 0.15,
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
        <span className="text-srg-accent">04</span> — PROJETS
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-24">
        <h2 className="text-display-sm font-bold mb-8">
          <span className="text-srg-white">RÉALISATIONS</span>
          <br />
          <span className="text-stroke text-srg-accent">NOTABLES</span>
        </h2>
        <p className="font-mono text-srg-muted max-w-xl">
          Des systèmes temps réel à haute échelle aux applications d'entreprise. 
          Des projets qui démontrent la profondeur technique et la pensée architecturale.
        </p>
      </div>

      {/* Stats ticker */}
      <div className="max-w-7xl mx-auto mb-16 overflow-hidden border-y border-srg-gray py-4">
        <div className="flex gap-16 animate-marquee">
          {[...stats, ...stats].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 shrink-0">
              <span className="text-4xl font-bold" style={{ color: stat.color }}>
                {stat.count}
              </span>
              <span className="font-mono text-xs text-srg-muted">
                {stat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div 
        ref={projectsRef}
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8"
      >
        {projects.map((project) => (
          <div
            key={project.title}
            className="project-card group relative overflow-hidden border border-srg-gray hover:border-srg-accent transition-all duration-500 cursor-pointer"
            data-cursor-hover
          >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden bg-srg-dark">
              <img 
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-srg-black via-transparent to-transparent opacity-80" />
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-bold text-srg-white mb-1 group-hover:text-srg-accent transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-mono text-xs text-srg-muted max-w-xs">
                    {project.description}
                  </p>
                </div>
                
                {/* Tags */}
                <div className="flex gap-2 flex-wrap justify-end max-w-[140px]">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] px-2 py-1 border"
                      style={{ 
                        borderColor: project.color,
                        color: project.color
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Corner accent */}
            <div 
              className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(135deg, transparent 50%, ${project.color}40 50%)` }}
            />
          </div>
        ))}
      </div>

      {/* View all CTA */}
      <div className="max-w-7xl mx-auto mt-16 text-center">
        <button
          data-cursor-hover
          className="font-mono text-sm text-srg-muted hover:text-srg-accent border-b border-current pb-1 transition-colors"
        >
          Voir GitHub →
        </button>
      </div>
    </section>
  )
}
