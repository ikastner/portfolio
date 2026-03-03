'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const skillCategories = [
  {
    number: '01',
    title: 'FRONT-END',
    description: 'Construction d\'interfaces utilisateur modernes et responsives avec les frameworks et bibliothèques standards du secteur.',
    level: 'Urssaf + HETIC',
    skills: ['Angular', 'TypeScript', 'Vue.js', 'Ionic', 'PrimeNG', 'Next.js', 'React']
  },
  {
    number: '02',
    title: 'BACK-END',
    description: 'Développement d\'API robustes et d\'applications serveur avec emphase sur performance et scalabilité.',
    level: 'Urssaf + HETIC',
    skills: ['C#', '.NET', 'Go (Golang)', 'REST APIs', 'PostgreSQL', 'Redis']
  },
  {
    number: '03',
    title: 'DEVOPS & INFRA',
    description: 'Architecture cloud-native, conteneurisation et infrastructure-as-code pour des déploiements scalables.',
    level: 'HETIC',
    skills: ['Kubernetes (EKS)', 'Terraform', 'NATS', 'Docker', 'CI/CD', 'SonarQube']
  },
  {
    number: '04',
    title: 'LOW-CODE & OUTILS',
    description: 'Plateformes de développement rapide d\'applications et d\'automatisation des processus métier.',
    level: 'Urssaf',
    skills: ['Power Platform', 'Power Apps', 'Power Automate', 'Power BI', 'Convertigo', 'UIPath', 'n8n']
  },
  {
    number: '05',
    title: 'ARCHITECTURE',
    description: 'Design système, architecture microservices et construction pour haute disponibilité et scalabilité.',
    level: 'Urssaf + HETIC',
    skills: ['Microservices', 'System Design', 'Scalabilité', 'Haute Disponibilité', 'Systèmes Temps Réel']
  }
]

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const modulesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const modulesContainer = modulesRef.current

    if (!section || !modulesContainer) return

    const moduleCards = modulesContainer.querySelectorAll('.module-card')

    moduleCards.forEach((card, i) => {
      gsap.fromTo(card,
        { x: i % 2 === 0 ? -100 : 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
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
        <span className="text-srg-accent">02</span> — COMPÉTENCES
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-24">
        <h2 className="text-display-sm font-bold mb-8">
          <span className="text-srg-white">STACK</span>
          <br />
          <span className="text-stroke text-srg-accent">TECHNIQUE</span>
        </h2>
        <p className="font-mono text-srg-muted max-w-xl">
          Expertise Full-Stack couvrant frontend, backend, DevOps et architecture cloud. 
          Du développement Low-Code rapide aux systèmes haute performance sur mesure.
        </p>
      </div>

      {/* Skills */}
      <div ref={modulesRef} className="max-w-7xl mx-auto space-y-8">
        {skillCategories.map((category, i) => (
          <div
            key={category.number}
            className="module-card group relative border border-srg-gray hover:border-srg-accent transition-colors duration-500 p-6 md:p-8"
          >
            {/* Number */}
            <div className="absolute -top-4 left-6 bg-srg-black px-2">
              <span className="font-mono text-xs text-srg-accent tracking-wider">
                {category.number}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Title & Description */}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-srg-white mb-2 group-hover:text-srg-accent transition-colors">
                  {category.title}
                </h3>
                <p className="font-mono text-sm text-srg-muted max-w-lg">
                  {category.description}
                </p>
              </div>

              {/* Level */}
              <div className="font-mono text-xs text-srg-accent border border-srg-gray px-3 py-1">
                {category.level}
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 md:w-64">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-xs text-srg-muted border border-srg-gray px-2 py-1 hover:border-srg-accent hover:text-srg-white transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mindset section */}
      <div className="max-w-7xl mx-auto mt-32 border-t border-srg-gray pt-16">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-4xl font-bold text-srg-white mb-6">
              SÉCURITÉ <span className="text-srg-accent">AVANT TOUT</span>
            </h3>
            <p className="font-mono text-srg-muted text-sm leading-relaxed">
              Mentalité Security-First dans tout développement. Des pratiques de code sécurisé 
              au durcissement de l'infrastructure. Construction de systèmes non seulement scalables 
              mais résilients face aux menaces.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-8xl text-srg-accent/20">
              🔒
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
