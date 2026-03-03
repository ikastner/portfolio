'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, useTexture } from '@react-three/drei'
import * as THREE from 'three'

type CharacterState = {
  position: [number, number, number]
  rotation: [number, number, number]
  anim: 'idle' | 'walk' | 'excited' | 'thinking' | 'celebrate'
  accentColor: string
}

// Refined stylized character
function Character({ scrollProgress }: { scrollProgress: number }) {
  const characterRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  const { viewport } = useThree()
  
  const getCharacterState = (progress: number): CharacterState => {
    if (progress < 0.15) {
      return {
        position: [2.5, -0.5, 0],
        rotation: [0, -0.4, 0],
        anim: 'idle',
        accentColor: '#ff3d00'
      }
    } else if (progress < 0.35) {
      const walkProgress = (progress - 0.15) / 0.2
      return {
        position: [
          2.5 - walkProgress * 5,
          -0.5 + Math.sin(walkProgress * Math.PI * 8) * 0.08,
          0
        ],
        rotation: [0, 0, 0],
        anim: 'walk',
        accentColor: '#00d4ff'
      }
    } else if (progress < 0.55) {
      return {
        position: [-2.5, -0.5, 0],
        rotation: [0, 0.3, 0],
        anim: 'excited',
        accentColor: '#ff3d00'
      }
    } else if (progress < 0.75) {
      return {
        position: [0, -0.5, 0.5],
        rotation: [0, -0.6, 0],
        anim: 'thinking',
        accentColor: '#ffffff'
      }
    } else {
      return {
        position: [0, -0.5, 0],
        rotation: [0, 0, 0],
        anim: 'celebrate',
        accentColor: '#ff0033'
      }
    }
  }

  const state = getCharacterState(scrollProgress)
  const time = useRef(0)

  useFrame((frameState) => {
    if (!characterRef.current || !glowRef.current) return
    
    const t = frameState.clock.elapsedTime
    time.current += 0.016
    
    // Smooth movement
    characterRef.current.position.x = THREE.MathUtils.lerp(
      characterRef.current.position.x, state.position[0], 0.025
    )
    characterRef.current.position.y = THREE.MathUtils.lerp(
      characterRef.current.position.y, state.position[1], 0.025
    )
    characterRef.current.rotation.y = THREE.MathUtils.lerp(
      characterRef.current.rotation.y, state.rotation[1], 0.025
    )
    
    // Glow pulse
    const mat = glowRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.08 + Math.sin(t * 2) * 0.03
    glowRef.current.scale.setScalar(1 + Math.sin(t) * 0.05)
    
    // Head movement
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.4) * 0.06
      headRef.current.position.y = 1.45 + Math.sin(t * 1.5) * 0.015
    }
    
    // Arms
    if (leftArmRef.current && rightArmRef.current) {
      switch (state.anim) {
        case 'idle':
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.15, 0.05)
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.15, 0.05)
          leftArmRef.current.rotation.x = Math.sin(t) * 0.05
          rightArmRef.current.rotation.x = Math.cos(t) * 0.05
          break
        case 'walk':
          const walkCycle = t * 4
          leftArmRef.current.rotation.x = Math.sin(walkCycle) * 0.4
          rightArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.4
          leftArmRef.current.rotation.z = 0.1
          rightArmRef.current.rotation.z = -0.1
          break
        case 'excited':
          leftArmRef.current.rotation.z = -0.5 + Math.sin(t * 5) * 0.2
          rightArmRef.current.rotation.z = 0.5 - Math.sin(t * 5) * 0.2
          leftArmRef.current.rotation.x = -0.7 + Math.sin(t * 6) * 0.3
          rightArmRef.current.rotation.x = -0.7 + Math.cos(t * 6) * 0.3
          break
        case 'thinking':
          leftArmRef.current.rotation.z = 0
          leftArmRef.current.rotation.x = 0
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 1.4, 0.05)
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.5, 0.05)
          break
        case 'celebrate':
          leftArmRef.current.rotation.z = -2.3 + Math.sin(t * 8) * 0.15
          rightArmRef.current.rotation.z = 2.3 - Math.sin(t * 8) * 0.15
          break
      }
    }
    
    // Legs
    if (leftLegRef.current && rightLegRef.current) {
      if (state.anim === 'walk') {
        const walkCycle = t * 4
        leftLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.45
        rightLegRef.current.rotation.x = Math.sin(walkCycle) * 0.45
      } else {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1)
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1)
      }
    }
  })

  const isMobile = viewport.width < 6
  const charScale = isMobile ? 0.65 : 1.0

  // Shared materials
  const skinMat = <meshStandardMaterial color="#d4a89a" roughness={0.5} metalness={0.1} />
  const hairMat = <meshStandardMaterial color="#0d0d0d" roughness={0.7} metalness={0.2} emissive="#0d0d0d" emissiveIntensity={0.1} />
  const shirtMat = <meshStandardMaterial color="#0a0a0a" roughness={0.6} metalness={0.3} emissive={state.accentColor} emissiveIntensity={0.15} />
  const pantsMat = <meshStandardMaterial color="#080808" roughness={0.7} metalness={0.1} />

  return (
    <group 
      ref={characterRef} 
      scale={charScale}
      position={[2.5, -0.5, 0]}
    >
      {/* Glow plane */}
      <mesh ref={glowRef} position={[0, 1, -4]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color={state.accentColor} transparent opacity={0.08} />
      </mesh>

      {/* HEAD */}
      <group ref={headRef} position={[0, 1.45, 0]}>
        {/* Face - oval shape */}
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.32, 0.5, 4, 12]} />
          {skinMat}
        </mesh>
        
        {/* Jaw */}
        <mesh position={[0, -0.3, 0.05]} castShadow>
          <boxGeometry args={[0.5, 0.25, 0.45]} />
          {skinMat}
        </mesh>

        {/* Ears */}
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.08, 0.18, 8]} />
          {skinMat}
        </mesh>
        <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.08, 0.18, 8]} />
          {skinMat}
        </mesh>

        {/* Styled Hair */}
        <group>
          {/* Top volume */}
          <mesh position={[0, 0.35, -0.05]} castShadow>
            <sphereGeometry args={[0.38, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            {hairMat}
          </mesh>
          {/* Front styled pieces */}
          <mesh position={[0.15, 0.4, 0.25]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.12, 0.3, 0.08]} />
            {hairMat}
          </mesh>
          <mesh position={[-0.1, 0.45, 0.22]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.1, 0.25, 0.08]} />
            {hairMat}
          </mesh>
          {/* Side swept */}
          <mesh position={[-0.32, 0.2, 0.1]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.12, 0.35, 0.4]} />
            {hairMat}
          </mesh>
          <mesh position={[0.32, 0.25, 0.05]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.1, 0.3, 0.35]} />
            {hairMat}
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.1, -0.3]}>
            <sphereGeometry args={[0.35, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            {hairMat}
          </mesh>
        </group>

        {/* Beard */}
        <group position={[0, -0.25, 0.05]}>
          {/* Main beard shape */}
          <mesh position={[0, -0.15, 0.15]} castShadow>
            <coneGeometry args={[0.32, 0.45, 6]} />
            {hairMat}
          </mesh>
          {/* Sideburns */}
          <mesh position={[-0.28, 0.05, 0.05]}>
            <boxGeometry args={[0.08, 0.25, 0.12]} />
            {hairMat}
          </mesh>
          <mesh position={[0.28, 0.05, 0.05]}>
            <boxGeometry args={[0.08, 0.25, 0.12]} />
            {hairMat}
          </mesh>
          {/* Mustache */}
          <mesh position={[0, 0.05, 0.28]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.03, 0.3, 4, 8]} />
            {hairMat}
          </mesh>
          {/* Goatee */}
          <mesh position={[0, -0.25, 0.35]}>
            <coneGeometry args={[0.1, 0.2, 4]} />
            {hairMat}
          </mesh>
        </group>

        {/* Eyes - dark and expressive */}
        <group position={[0, 0.05, 0.28]}>
          <mesh position={[-0.12, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh position={[-0.12, 0.18, 0.3]} rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
          {hairMat}
        </mesh>
        <mesh position={[0.12, 0.18, 0.3]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
          {hairMat}
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.2, 10]} />
        {skinMat}
      </mesh>

      {/* BODY */}
      <group ref={bodyRef} position={[0, 0.55, 0]}>
        {/* Torso */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.9, 0.4]} />
          {shirtMat}
        </mesh>
        
        {/* Accent line */}
        <mesh position={[0, 0.15, 0.21]}>
          <boxGeometry args={[0.76, 0.04, 0.02]} />
          <meshBasicMaterial color={state.accentColor} />
        </mesh>

        {/* Shoulders */}
        <mesh position={[-0.45, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          {shirtMat}
        </mesh>
        <mesh position={[0.45, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          {shirtMat}
        </mesh>
      </group>

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.6, 0.75, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 4, 12]} />
          {shirtMat}
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 4, 12]} />
          {skinMat}
        </mesh>
        <mesh position={[0, -1.15, 0]}>
          <sphereGeometry args={[0.13, 10, 10]} />
          {skinMat}
        </mesh>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.6, 0.75, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 4, 12]} />
          {shirtMat}
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 4, 12]} />
          {skinMat}
        </mesh>
        <mesh position={[0, -1.15, 0]}>
          <sphereGeometry args={[0.13, 10, 10]} />
          {skinMat}
        </mesh>
      </group>

      {/* LEFT LEG */}
      <group ref={leftLegRef} position={[-0.22, 0.1, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.8, 4, 12]} />
          {pantsMat}
        </mesh>
        <mesh position={[0, -0.85, 0.08]}>
          <boxGeometry args={[0.22, 0.12, 0.45]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
      </group>

      {/* RIGHT LEG */}
      <group ref={rightLegRef} position={[0.22, 0.1, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.8, 4, 12]} />
          {pantsMat}
        </mesh>
        <mesh position={[0, -0.85, 0.08]}>
          <boxGeometry args={[0.22, 0.12, 0.45]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// Ambient particles
function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  
  const particleCount = 50
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 8
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.002
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ff3d00"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  )
}

// Main Canvas Component
export default function CharacterCanvas() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(scrollTop / docHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
    >
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 12], fov: 42 }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={40} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[4, 10, 6]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight 
          position={[-6, 4, 4]} 
          intensity={0.6}
          color="#ff3d00"
        />
        <pointLight position={[0, 4, 3]} intensity={0.5} color="#00d4ff" distance={10} />
        
        {/* Character */}
        <Character scrollProgress={scrollProgress} />
        
        {/* Particles */}
        <Particles />
      </Canvas>
    </div>
  )
}
