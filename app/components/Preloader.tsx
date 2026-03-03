'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
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

    // Animate logo letters with 3D effect
    const letters = logoRef.current?.querySelectorAll('.letter')
    if (letters) {
      tl.fromTo(
        letters,
        { y: 100, opacity: 0, rotateX: -90 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out'
        }
      )
    }

    // Progress bar animation with scale
    tl.to(
      progressBarRef.current,
      {
        scaleX: 1,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: function () {
          setProgress(Math.round(this.progress() * 100))
        }
      },
      '-=0.4'
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
      {/* Animated Logo with 3D perspective */}
      <div 
        ref={logoRef} 
        className="flex items-center gap-0 mb-12"
        style={{ perspective: '1000px' }}
      >
        {'IVANE'.split('').map((letter, i) => (
          <span
            key={i}
            className="letter text-7xl md:text-9xl font-black text-white tracking-tighter"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {letter}
          </span>
        ))}
        <span className="letter text-7xl md:text-9xl font-black text-orange-500 tracking-tighter">
          .
        </span>
      </div>

      {/* Progress Bar with gradient */}
      <div className="relative w-56 md:w-72 h-[3px] bg-neutral-800 rounded-full overflow-hidden">
        <div
          ref={progressBarRef}
          className="absolute inset-0 origin-left bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Progress Text */}
      <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500 font-mono">
        <span className="animate-pulse">Loading</span>
        <span className="text-orange-500 font-bold">{progress}%</span>
      </div>

      {/* Decorative animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-500" />
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-orange-500/30" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-orange-500/30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-orange-500/30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-orange-500/30" />
    </div>
  )
}
