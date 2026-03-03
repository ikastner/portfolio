'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const coordsRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [scrollPercent, setScrollPercent] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const updateScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollPercent(Math.round(progress * 100))
    }
    
    window.addEventListener('scroll', updateScroll, { passive: true })
    updateScroll()
    
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    const coordsDisplay = coordsRef.current
    if (!cursor || !coordsDisplay) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setCoords({ x: Math.round(mouseX), y: Math.round(mouseY) })
    }

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15

      if (cursor) {
        cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`
      }

      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    const animationId = requestAnimationFrame(animate)

    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]')
    
    const handleMouseEnter = () => {
      gsap.to(cursor, {
        scale: 1.5,
        borderColor: '#ff3d00',
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        borderColor: '#f5f5f5',
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          border: '1px solid #f5f5f5',
          borderRadius: '50%',
          willChange: 'transform',
        }}
      />
      
      {/* Coordinates display */}
      <div
        ref={coordsRef}
        className="fixed top-4 right-4 font-mono text-xs text-srg-muted pointer-events-none z-[9999] mix-blend-difference"
      >
        <div className="flex flex-col items-end gap-1">
          <span className="text-srg-accent">X: {coords.x.toString().padStart(4, '0')}</span>
          <span>Y: {coords.y.toString().padStart(4, '0')}</span>
          <span className="text-srg-muted mt-2">SCROLL: {scrollPercent}%</span>
        </div>
      </div>

      {/* Center crosshair */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9998] opacity-20">
        <div className="w-px h-8 bg-srg-accent" />
        <div className="h-px w-8 bg-srg-accent -mt-4 -ml-4" />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9997] opacity-[0.02]">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #ff3d00 1px, transparent 1px),
            linear-gradient(to bottom, #ff3d00 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
    </>
  )
}
