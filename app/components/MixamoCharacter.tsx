'use client'

import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, useTexture } from '@react-three/drei'
import { FBXLoader } from 'three-stdlib'
import * as THREE from 'three'

// Path configuration - Load character from first animation which has skin+skeleton
const MIXAMO_PATH = '/animation'
// Use Hanging Idle as base character (has skin + skeleton)
const CHARACTER_FBX = `${MIXAMO_PATH}/Hanging Idle.fbx`
const TEXTURE_BASE = `${MIXAMO_PATH}/ivane`

// Animation mapping configuration - PARKOUR PREMIUM SEQUENCE
const ADDITIONAL_ANIMATIONS = {
  hanging: { file: 'Hanging Idle.fbx', speed: 0.8, loop: true },
  climb: { file: 'Climbing Up Wall.fbx', speed: 1.0, loop: false },
  sprint: { file: 'Two Cycle Sprint.fbx', speed: 1.2, loop: true },
  jump: { file: 'Jumping Up.fbx', speed: 1.0, loop: false },
  wallRun: { file: 'Wall Run.fbx', speed: 1.1, loop: false },
  slide: { file: 'Running Slide.fbx', speed: 1.0, loop: false },
  roll: { file: 'Falling To Roll.fbx', speed: 1.2, loop: false },
  victory: { file: 'Victory.fbx', speed: 0.9, loop: false },
}

type AnimationName = 'idle' | keyof typeof ADDITIONAL_ANIMATIONS

interface CharacterState {
  position: [number, number, number]
  rotation: [number, number, number]
  anim: AnimationName
  animTime: number
}

// Character component with Mixamo animations
function MixamoCharacter({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [animations, setAnimations] = useState<Record<string, THREE.AnimationClip>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [texturesLoaded, setTexturesLoaded] = useState(false)
  
  // Load textures
  const diffuseMap = useTexture(`${TEXTURE_BASE}/texture_diffuse.png`)
  const normalMap = useTexture(`${TEXTURE_BASE}/texture_normal.png`)
  const roughnessMap = useTexture(`${TEXTURE_BASE}/texture_roughness.png`)
  
  // Apply textures once loaded
  useEffect(() => {
    if (!model || !diffuseMap) return
    
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.map = diffuseMap
            mat.normalMap = normalMap
            mat.roughnessMap = roughnessMap
            mat.needsUpdate = true
          }
        })
      }
    })
    setTexturesLoaded(true)
  }, [model, diffuseMap, normalMap, roughnessMap])
  
  // Load character and all animations
  useEffect(() => {
    const loadCharacterAndAnimations = async () => {
      const loader = new FBXLoader()
      
      // 1. Load main character (with skin)
      console.log('Loading character from:', CHARACTER_FBX)
      const characterFbx = await loader.loadAsync(CHARACTER_FBX)
      console.log('Character loaded:', characterFbx)
      
      // Log bone structure
      const bones: string[] = []
      characterFbx.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Bone) {
          bones.push(child.name)
        }
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      console.log('Character bone structure:', bones)
      
      // Store the character model
      setModel(characterFbx)
      
      // 2. Load animations and retarget them
      const loadedAnims: Record<string, THREE.AnimationClip> = {}
      
      for (const [name, config] of Object.entries(ADDITIONAL_ANIMATIONS)) {
        try {
          const url = `${MIXAMO_PATH}/${config.file}`
          console.log(`Loading animation: ${url}`)
          const animFbx = await loader.loadAsync(url)
          
          if (animFbx.animations.length > 0) {
            const clip = animFbx.animations[0]
            clip.name = name
            
            // Retarget animation to character skeleton if needed
            // The animation clip from Mixamo uses the same skeleton naming
            // so it should work directly with the character model
            loadedAnims[name] = clip
            console.log(`Animation ${name} loaded:`, clip.duration, 'seconds, tracks:', clip.tracks.length)
          }
        } catch (error) {
          console.warn(`Failed to load animation ${name}:`, error)
        }
      }
      
      console.log('All animations loaded:', Object.keys(loadedAnims))
      setAnimations(loadedAnims)
      setIsLoading(false)
    }
    
    loadCharacterAndAnimations()
  }, [])
  
  // Setup animation mixer
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({})
  const prevAnimRef = useRef<AnimationName>('idle')
  
  useEffect(() => {
    if (!groupRef.current || !model || Object.keys(animations).length === 0) {
      console.log('Waiting for setup...', { 
        hasGroup: !!groupRef.current, 
        hasModel: !!model,
        animCount: Object.keys(animations).length 
      })
      return
    }
    
    console.log('Setting up mixer with', Object.keys(animations).length, 'animations')
    const mixer = new THREE.AnimationMixer(model)
    mixerRef.current = mixer
    
    // Create actions for each animation
    Object.entries(animations).forEach(([name, clip]) => {
      console.log(`Creating action for ${name}`)
      const action = mixer.clipAction(clip)
      action.clampWhenFinished = true
      action.enabled = true
      actionsRef.current[name] = action
    })
    
    // Start idle animation
    if (actionsRef.current['idle']) {
      console.log('Starting idle animation')
      actionsRef.current['idle'].play()
    }
    
    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(model)
    }
  }, [model, animations])
  
  // Get character state based on scroll progress - PARKOUR PREMIUM SEQUENCE
  const getCharacterState = (progress: number): CharacterState => {
    // 0.0 - 0.12: HERO — Hanging Idle (suspension introductive)
    if (progress < 0.12) {
      const p = progress / 0.12
      return {
        position: [2, -3.5 - p * 0.5, -2],
        rotation: [0, -0.8 + p * 0.3, 0],
        anim: 'hanging',
        animTime: p
      }
    }
    // 0.12 - 0.18: Transition climb (ascension vers la section)
    else if (progress < 0.18) {
      const p = (progress - 0.12) / 0.06
      return {
        position: [2, -4.0 - p * 1.5, -2 + p * 1.5],
        rotation: [0, -0.5, 0],
        anim: 'climb',
        animTime: p
      }
    }
    // 0.18 - 0.35: ABOUT — Sprint (vitesse d'exécution)
    else if (progress < 0.35) {
      const p = (progress - 0.18) / 0.17
      return {
        position: [2 - p * 4, -5.5, -0.5 + p * 0.5],
        rotation: [0, 0, 0],
        anim: 'sprint',
        animTime: p
      }
    }
    // 0.35 - 0.48: CURRICULUM — Jump Up (progression verticale)
    else if (progress < 0.48) {
      const p = (progress - 0.35) / 0.13
      // Arc de saut avec apex à 50%
      const heightBoost = Math.sin(p * Math.PI) * 2.5
      return {
        position: [-2, -5.5 + heightBoost, 0],
        rotation: [0, 0, 0],
        anim: 'jump',
        animTime: p
      }
    }
    // 0.48 - 0.62: MENTORS — Wall Run (moment spectaculaire)
    else if (progress < 0.62) {
      const p = (progress - 0.48) / 0.14
      return {
        position: [-2 + p * 1.5, -3.0, -1 + p * 0.5],
        rotation: [0, 0.6, 0],
        anim: 'wallRun',
        animTime: p
      }
    }
    // 0.62 - 0.75: SHOWCASE — Running Slide (maîtrise technique)
    else if (progress < 0.75) {
      const p = (progress - 0.62) / 0.13
      return {
        position: [-0.5 + p * 3, -4.8, -0.5 + p],
        rotation: [0, 0.2, 0],
        anim: 'slide',
        animTime: p
      }
    }
    // 0.75 - 0.88: FOOTER — Falling To Roll (réception pro)
    else if (progress < 0.88) {
      const p = (progress - 0.75) / 0.13
      return {
        position: [2.5 - p * 1, -5.3, 0.5 - p * 0.5],
        rotation: [0, -0.3, 0],
        anim: 'roll',
        animTime: p
      }
    }
    // 0.88 - 1.0: Victory pose (conclusion élégante)
    else {
      const p = (progress - 0.88) / 0.12
      return {
        position: [1.5, -5.5, 0],
        rotation: [0, -0.6, 0],
        anim: 'victory',
        animTime: p
      }
    }
  }
  
  const state = getCharacterState(scrollProgress)
  
  // Update animation
  useFrame((_, delta) => {
    if (!groupRef.current || !mixerRef.current) return
    
    // Update mixer
    mixerRef.current.update(delta)
    
    // Smooth position transition
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      state.position[0],
      0.05
    )
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      state.position[1],
      0.05
    )
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      state.position[2],
      0.05
    )
    
    // Smooth rotation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      state.rotation[1],
      0.05
    )
    
    // Handle animation transitions with optimized crossfade
    if (state.anim !== prevAnimRef.current) {
      const prevAction = actionsRef.current[prevAnimRef.current]
      const nextAction = actionsRef.current[state.anim]
      
      if (prevAction && nextAction) {
        // Extended crossfade for seamless blending (450ms)
        const crossfadeDuration = 0.45
        
        // Fade out previous while fading in next
        prevAction.fadeOut(crossfadeDuration)
        nextAction.reset().fadeIn(crossfadeDuration).play()
        
        // Preserve momentum through velocity matching
        const prevTime = prevAction.time
        const nextClip = nextAction.getClip()
        
        // Offset next animation to momentum-compatible pose
        if (state.anim === 'jump' && prevAnimRef.current === 'sprint') {
          // Jump starts at 15% to skip wind-up, preserve sprint momentum
          nextAction.time = nextClip.duration * 0.15
        } else if (state.anim === 'wallRun' && prevAnimRef.current === 'jump') {
          // Wall run starts at contact point (22%)
          nextAction.time = nextClip.duration * 0.22
        } else if (state.anim === 'slide' && prevAnimRef.current === 'wallRun') {
          // Slide starts at entry point (10%)
          nextAction.time = nextClip.duration * 0.10
        } else if (state.anim === 'roll' && prevAnimRef.current === 'slide') {
          // Roll starts with forward momentum (20%)
          nextAction.time = nextClip.duration * 0.20
        }
      } else if (nextAction) {
        nextAction.reset().fadeIn(0.3).play()
      }
      
      prevAnimRef.current = state.anim
    }
    
    // Set animation time based on scroll progress
    const action = actionsRef.current[state.anim]
    if (action && action.getClip()) {
      const config = ADDITIONAL_ANIMATIONS[state.anim as keyof typeof ADDITIONAL_ANIMATIONS]
      const speed = config?.speed || 1.0
      const loop = config?.loop || false
      
      // For looping animations (sprint), use continuous time
      // For one-shot animations, map to scroll progress
      if (loop) {
        // Continuous playback for loop animations
        action.time += delta * speed
      } else {
        // Scroll-driven for one-shot animations
        const targetTime = state.animTime * action.getClip().duration
        action.time = targetTime
      }
    }
  })
  
  if (isLoading || !model) {
    return null
  }
  
  return (
    <group ref={groupRef} scale={0.03} position={[0, -8, 0]}>
      <primitive object={model} />
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
export default function MixamoCharacterCanvas() {
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
        <ambientLight intensity={1.0} />
        <directionalLight 
          position={[5, 10, 7]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.8}
          color="#ff3d00"
        />
        <pointLight position={[2, 3, 2]} intensity={0.6} color="#ffffff" distance={15} />
        <hemisphereLight args={['#ffffff', '#444444', 0.5]} />
        
        {/* Character with Suspense */}
        <Suspense fallback={null}>
          <MixamoCharacter scrollProgress={scrollProgress} />
        </Suspense>
        
        {/* Particles */}
        <Particles />
      </Canvas>
    </div>
  )
}
