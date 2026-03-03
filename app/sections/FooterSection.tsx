'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const elements = section.querySelectorAll('.footer-animate')

    elements.forEach((el, i) => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
    setEmail('')
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32 z-10"
    >
      {/* Section indicator */}
      <div className="absolute top-32 left-6 md:left-12 lg:left-24 font-mono text-xs text-srg-muted footer-animate">
        <span className="text-srg-accent">05</span> — CONTACT
      </div>

      {/* Main CTA */}
      <div className="max-w-7xl mx-auto">
        <div className="footer-animate mb-16">
          <h2 className="text-display-sm font-bold mb-8">
            <span className="text-srg-white">CONTACTEZ</span>
            <br />
            <span className="text-srg-accent">MOI</span>
          </h2>
          <p className="font-mono text-srg-muted max-w-xl">
            Ouvert aux opportunités en développement Full-Stack, CTO/Tech Lead, 
            et positions d'architecture Cloud. Basé à Montreuil, France.
          </p>
        </div>

        {/* Registration Form */}
        <form 
          ref={formRef}
          onSubmit={handleSubmit}
          className="footer-animate max-w-2xl border border-srg-gray p-8 md:p-12"
        >
          <div className="mb-8">
            <label className="block font-mono text-xs text-srg-accent mb-4">
              [ENVOYER_UN_MESSAGE]
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 bg-transparent border border-srg-gray px-4 py-3 font-mono text-sm text-srg-white placeholder:text-srg-muted focus:border-srg-accent focus:outline-none transition-colors"
              />
              <button
                type="submit"
                data-cursor-hover
                disabled={isSubmitted}
                className="px-8 py-3 bg-srg-accent text-srg-black font-bold text-sm tracking-wider uppercase hover:bg-srg-white transition-colors disabled:opacity-50"
              >
                {isSubmitted ? 'ENVOYÉ ✓' : 'ENVOYER'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-srg-muted">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              DISPONIBLE POUR TRAVAILLER
            </span>
            <span>|</span>
            <span>MONTREUIL, FRANCE</span>
            <span>|</span>
            <span>HYBRIDE / TÉLÉTRAVAIL</span>
          </div>
        </form>

        {/* Footer Grid */}
        <div className="footer-animate mt-24 grid md:grid-cols-4 gap-8 border-t border-srg-gray pt-12">
          {/* Brand */}
          <div>
            <div className="font-bold text-xl text-srg-white mb-4">IVANE KASTNER</div>
            <p className="font-mono text-xs text-srg-muted leading-relaxed">
              Développeur Full-Stack | Mastère CTO & Tech Lead
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="font-mono text-xs text-srg-accent mb-4">[NAVIGATION]</div>
            <ul className="space-y-2 font-mono text-sm text-srg-muted">
              <li><a href="#" className="hover:text-srg-white transition-colors">À Propos</a></li>
              <li><a href="#" className="hover:text-srg-white transition-colors">Compétences</a></li>
              <li><a href="#" className="hover:text-srg-white transition-colors">Projets</a></li>
              <li><a href="#" className="hover:text-srg-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <div className="font-mono text-xs text-srg-accent mb-4">[LIENS]</div>
            <ul className="space-y-2 font-mono text-sm text-srg-muted">
              <li><a href="#" className="hover:text-srg-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-srg-white transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-srg-white transition-colors">Twitter</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="font-mono text-xs text-srg-accent mb-4">[CONTACT]</div>
            <ul className="space-y-2 font-mono text-sm text-srg-muted">
              <li>ivane@kastner.dev</li>
              <li>Montreuil, France</li>
              <li className="text-srg-accent">UTC+1</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-animate mt-12 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-srg-muted border-t border-srg-gray pt-8">
          <div>
            © 2025 Ivane Kastner. Tous droits réservés.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-srg-white transition-colors">Politique de Confidentialité</a>
            <a href="#" className="hover:text-srg-white transition-colors">Mentions Légales</a>
          </div>
          <div className="text-srg-accent">
            DÉVELOPPÉ AVEC NEXT.JS & THREE.JS
          </div>
        </div>

        {/* Easter egg */}
        <div className="footer-animate mt-12 text-center">
          <p className="font-mono text-xs text-srg-muted opacity-50">
            Continuez à faire défiler pour une surprise... 🖕
            Keep scrolling for a surprise... 🖕
          </p>
        </div>
      </div>

      {/* Big background text */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none">
        <div className="text-[20vw] font-bold text-stroke text-srg-gray/10 leading-none translate-y-1/3">
          IVANE
        </div>
      </div>
    </section>
  )
}
