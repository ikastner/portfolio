'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => onComplete?.()
        })
      }
    })

    // Animate logo letters
    const letters = logoRef.current?.querySelectorAll('.letter')
    if (letters) {
      tl.fromTo(
        letters,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out'
        }
      )
    }

    // Progress bar animation
    tl.to(
      {},
      {
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: function () {
          const prog = Math.round(this.progress() * 100)
          setProgress(prog)
        }
      },
      '-=0.3'
    )

    // Fade out logo
    tl.to(logoRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    })

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
    >
      {/* Logo with letters */}
      <div ref={logoRef} className="flex items-center gap-1 mb-12">
        {'IVANE'.split('').map((letter, i) => (
          <span
            key={i}
            className="letter text-6xl md:text-8xl font-bold text-white tracking-tighter"
          >
            {letter}
          </span>
        ))}
        <span className="letter text-6xl md:text-8xl font-bold text-orange-500 tracking-tighter">
          .
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-48 md:w-64 h-[2px] bg-neutral-800 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="mt-4 text-xs text-neutral-500 font-mono">
        {progress}%
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
