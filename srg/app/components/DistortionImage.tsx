'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// GLSL Shaders for distortion effect
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;
  
  // Simplex noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Calculate distance from mouse
    vec2 mouseUV = uMouse;
    float dist = distance(uv, mouseUV);
    
    // Liquid distortion based on hover
    float hoverStrength = uHover * smoothstep(0.5, 0.0, dist);
    
    // Noise-based distortion
    float noise = snoise(uv * 3.0 + uTime * 0.5) * 0.5 + 0.5;
    float noise2 = snoise(uv * 5.0 - uTime * 0.3) * 0.5 + 0.5;
    
    // Ripple effect
    float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    ripple *= smoothstep(0.3, 0.0, dist);
    
    // Apply distortion
    vec2 distortion = vec2(
      noise * 0.02 + ripple * 0.03,
      noise2 * 0.02 + ripple * 0.03
    ) * hoverStrength;
    
    // RGB split (chromatic aberration)
    float rgbSplit = hoverStrength * 0.02;
    
    vec4 colorR = texture2D(uTexture, uv + distortion + vec2(rgbSplit, 0.0));
    vec4 colorG = texture2D(uTexture, uv + distortion);
    vec4 colorB = texture2D(uTexture, uv + distortion - vec2(rgbSplit, 0.0));
    
    vec4 finalColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
    
    // Add subtle color shift on hover
    finalColor.r += hoverStrength * 0.1;
    finalColor.b -= hoverStrength * 0.05;
    
    gl_FragColor = finalColor;
  }
`

// Shader Plane Component
function ShaderPlane({ imageUrl, isHovered, mousePosition }: { 
  imageUrl: string
  isHovered: boolean
  mousePosition: { x: number, y: number }
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const { viewport } = useThree()

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, (tex) => {
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      setTexture(tex)
    })
  }, [imageUrl])

  const uniforms = useRef({
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1, 1) }
  })

  useEffect(() => {
    if (texture) {
      uniforms.current.uTexture.value = texture
    }
  }, [texture])

  useFrame((state) => {
    if (!meshRef.current) return
    
    uniforms.current.uTime.value = state.clock.elapsedTime
    
    // Smooth hover transition
    const targetHover = isHovered ? 1.0 : 0.0
    uniforms.current.uHover.value += (targetHover - uniforms.current.uHover.value) * 0.1
    
    // Update mouse position
    uniforms.current.uMouse.value.set(mousePosition.x, mousePosition.y)
  })

  if (!texture) return null

  return (
    <mesh ref={meshRef} scale={[viewport.width * 0.3, viewport.width * 0.3 * 1.2, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
      />
    </mesh>
  )
}

// Main Distortion Image Component
interface DistortionImageProps {
  src: string
  alt: string
  className?: string
}

export default function DistortionImage({ src, alt, className = '' }: DistortionImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = 1.0 - (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {isVisible && (
        <Canvas
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 1], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ShaderPlane 
            imageUrl={src} 
            isHovered={isHovered} 
            mousePosition={mousePos}
          />
        </Canvas>
      )}
      
      {/* Fallback image for SEO/accessibility */}
      <img 
        src={src} 
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
      />
    </div>
  )
}
