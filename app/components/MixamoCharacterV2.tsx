'use client'

import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, useTexture } from '@react-three/drei'
import { FBXLoader } from 'three-stdlib'
import * as THREE from 'three'

// ============================================
// CONFIGURATION - SÉQUENCE PARKOUR PREMIUM
// ============================================
const MIXAMO_PATH = '/animation'
const CHARACTER_FBX = `${MIXAMO_PATH}/Hanging Idle.fbx`
const TEXTURE_BASE = `${MIXAMO_PATH}/ivane`

// 7 mouvements créant un arc narratif complet
const ANIMATION_CONFIG = {
  // Phase 1: Introduction - Suspension et ascension
  hanging: { 
    file: 'Hanging Idle.fbx', 
    speed: 0.8, 
    loop: true,
    section: 'hero',
    narrative: 'Suspension/introduction — le personnage s\'accroche au projet'
  },
  climb: { 
    file: 'Climbing Up Wall.fbx', 
    speed: 1.0, 
    loop: false,
    section: 'hero',
    narrative: 'Ascension vers la solution'
  },
  
  // Phase 2: Vitesse et efficacité
  sprint: { 
    file: 'Two Cycle Sprint.fbx', 
    speed: 1.2, 
    loop: true,
    section: 'about',
    narrative: 'Phase de croisière, stack technique en action'
  },
  
  // Phase 3: Progression verticale
  jump: { 
    file: 'Jumping Up.fbx', 
    speed: 1.0, 
    loop: false,
    section: 'curriculum',
    narrative: 'Progression verticale des compétences'
  },
  
  // Phase 4: Défi gravité (moment fort)
  wallRun: { 
    file: 'Wall Run.fbx', 
    speed: 1.1, 
    loop: false,
    section: 'mentors',
    narrative: 'Défier les lois du possible'
  },
  
  // Phase 5: Maîtrise technique
  slide: { 
    file: 'Running Slide.fbx', 
    speed: 1.0, 
    loop: false,
    section: 'showcase',
    narrative: 'Maîtrise technique sous pression'
  },
  
  // Phase 6: Réception professionnelle
  roll: { 
    file: 'Falling To Roll.fbx', 
    speed: 1.2, 
    loop: false,
    section: 'footer',
    narrative: 'Réception élégante, retour au sol'
  },
  
  // Phase 7: Conclusion victorieuse
  victory: { 
    file: 'Victory.fbx', 
    speed: 0.9, 
    loop: false,
    section: 'end',
    narrative: 'Point d\'orgue final'
  },
}

type AnimationName = keyof typeof ANIMATION_CONFIG

// Protocole de fluidité - Points de raccordement idéaux
const SYNC_POINTS: Record<string, number> = {
  'sprint.jump': 0.85,      // 85% du sprint = pieds groupés, prêt à décoller
  'jump.wallRun': 0.78,     // 78% du jump = apex atteint, contact mur
  'wallRun.slide': 0.65,    // 65% du wall run = décrochage naturel
  'slide.roll': 0.90,       // 90% du slide = friction max, transfert énergie
  'roll.victory': 0.80      // 80% du roll = verticalité retrouvée
}

const CROSSFADE_DURATION = 0.45
const TRANSITION_COOLDOWN = 0.12

const ENTRY_OFFSETS: Partial<Record<AnimationName, number>> = {
  climb: 0.05,
  jump: 0.12,
  wallRun: 0.22,
  slide: 0.10,
  roll: 0.20,
}

// Détection des poses compatibles pour blend direct
const POSE_COMPATIBILITY: Record<string, string[]> = {
  'sprint': ['jump', 'slide'],
  'jump': ['wallRun', 'climb'],
  'wallRun': ['slide', 'roll'],
  'slide': ['roll'],
  'roll': ['victory']
}

function makeClipInPlace(name: string, source: THREE.AnimationClip) {
  const tracks = source.tracks.filter((track) => {
    const trackName = track.name.toLowerCase()
    const isRootPositionTrack =
      trackName.endsWith('.position') &&
      (trackName.includes('hips') || trackName.includes('mixamorig'))

    return !isRootPositionTrack
  })

  const clip = new THREE.AnimationClip(name, source.duration, tracks)
  clip.resetDuration()
  return clip
}

// ============================================
// TYPES
// ============================================
interface CharacterState {
  position: [number, number, number]
  rotation: [number, number, number]
  anim: AnimationName
  animTime: number
}

interface CameraRig {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
}

// ============================================
// CAMÉRA CHOREOGRAPHY
// ============================================
const CAMERA_RIG: Record<string, CameraRig> = {
  hero: {
    position: [4, 0.8, 8.6],
    lookAt: [0, -4.2, 0],
    fov: 38
  },
  sprint: {
    position: [2.4, 0.6, 7.2],
    lookAt: [0, -4.6, 0],
    fov: 42
  },
  wallRun: {
    position: [-2.2, 1.4, 6.4],
    lookAt: [-0.2, -3.8, -0.8],
    fov: 50
  },
  slide: {
    position: [0.4, 0.2, 6.2],
    lookAt: [0.6, -5.2, 0.7],
    fov: 45
  }
}

// ============================================
// COMPOSANT PERSONNAGE
// ============================================
function MixamoCharacter({ 
  scrollProgress, 
  onLoaded 
}: { 
  scrollProgress: number
  onLoaded?: () => void 
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [animations, setAnimations] = useState<Record<string, THREE.AnimationClip>>({})
  const [isLoading, setIsLoading] = useState(true)
  
  // Chargement des textures
  const diffuseMap = useTexture(`${TEXTURE_BASE}/texture_diffuse.png`)
  const normalMap = useTexture(`${TEXTURE_BASE}/texture_normal.png`)
  const roughnessMap = useTexture(`${TEXTURE_BASE}/texture_roughness.png`)
  
  // État de l'animation
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({})
  const prevAnimRef = useRef<AnimationName>('hanging')
  const transitionAtRef = useRef(0)
  const hasNotifiedRef = useRef(false)
  
  // ============================================
  // CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    const loadCharacterAndAnimations = async () => {
      const loader = new FBXLoader()
      
      // 1. Charger le personnage (skin + squelette)
      console.log('[Parkour] Loading character from:', CHARACTER_FBX)
      const characterFbx = await loader.loadAsync(CHARACTER_FBX)
      console.log('[Parkour] Character loaded with', characterFbx.animations.length, 'animations')
      
      // Appliquer les textures
      characterFbx.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.map = diffuseMap
            child.material.normalMap = normalMap
            child.material.roughnessMap = roughnessMap
            child.material.needsUpdate = true
          }
        }
      })
      
      setModel(characterFbx)
      
      // 2. Charger toutes les animations
      const loadedAnims: Record<string, THREE.AnimationClip> = {}
      
      for (const [name, config] of Object.entries(ANIMATION_CONFIG)) {
        try {
          // Ne pas recharger Hanging Idle (déjà dans le character)
          if (name === 'hanging') {
            if (characterFbx.animations.length > 0) {
              const clip = makeClipInPlace(name, characterFbx.animations[0])
              loadedAnims[name] = clip
              console.log(`[Parkour] Animation ${name}:`, clip.duration.toFixed(2), 's')
            }
            continue
          }
          
          const url = `${MIXAMO_PATH}/${config.file}`
          console.log(`[Parkour] Loading: ${url}`)
          const animFbx = await loader.loadAsync(url)
          
          if (animFbx.animations.length > 0) {
            const clip = makeClipInPlace(name, animFbx.animations[0])
            loadedAnims[name] = clip
            console.log(`[Parkour] Animation ${name}:`, clip.duration.toFixed(2), 's,', clip.tracks.length, 'tracks')
          }
        } catch (error) {
          console.warn(`[Parkour] Failed to load ${name}:`, error)
        }
      }
      
      setAnimations(loadedAnims)
      setIsLoading(false)
      
      // Notify parent that model is loaded
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true
        console.log('[Parkour] Model fully loaded, notifying parent')
        onLoaded?.()
      }
    }
    
    loadCharacterAndAnimations()
  }, [diffuseMap, normalMap, roughnessMap, onLoaded])
  
  // ============================================
  // SETUP MIXER
  // ============================================
  useEffect(() => {
    if (!groupRef.current || !model || Object.keys(animations).length === 0) return
    
    const mixer = new THREE.AnimationMixer(model)
    mixerRef.current = mixer
    
    // Créer les actions pour chaque animation
    Object.entries(animations).forEach(([name, clip]) => {
      const action = mixer.clipAction(clip)
      const isLoop = ANIMATION_CONFIG[name as AnimationName]?.loop
      action.clampWhenFinished = !isLoop
      action.setLoop(isLoop ? THREE.LoopRepeat : THREE.LoopOnce, isLoop ? Infinity : 1)
      action.timeScale = 1
      action.enabled = true
      actionsRef.current[name] = action
    })
    
    // Démarrer avec hanging
    if (actionsRef.current['hanging']) {
      actionsRef.current['hanging'].play()
    }
    
    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(model)
    }
  }, [model, animations])
  
  // ============================================
  // GET CHARACTER STATE - LOGIQUE DE FLOW
  // ============================================
  const getCharacterState = (progress: number): CharacterState => {
    // SCROLL 0% → 15%: HERO — Hanging + Climb (Suspension)
    // Y: -7m (visible haut écran), Z: -2m
    if (progress < 0.15) {
      const p = progress / 0.15
      const animPhase = p < 0.6 ? 'hanging' : 'climb'
      const animTime = p < 0.6 ? p / 0.6 : (p - 0.6) / 0.4
      
      return {
        position: [2, -7 - p * 1.5, -2 + p * 1.5],
        rotation: [0, -0.8 + p * 0.8, 0],
        anim: animPhase as AnimationName,
        animTime,
      }
    }
    // SCROLL 15% → 35%: ABOUT — Sprint (Vitesse)
    // Y: -9m (centre écran)
    else if (progress < 0.35) {
      const p = (progress - 0.15) / 0.20
      return {
        position: [2 - p * 4, -9, 0],
        rotation: [0, 0, 0],
        anim: 'sprint',
        animTime: p,
      }
    }
    // SCROLL 35% → 50%: CURRICULUM — Jump Up (Progression)
    // Y: -9m → -7m (saut visible)
    else if (progress < 0.50) {
      const p = (progress - 0.35) / 0.15
      const apexPhase = Math.sin(p * Math.PI) * 2
      
      return {
        position: [-2, -9 + apexPhase, 0],
        rotation: [0, 0, 0],
        anim: 'jump',
        animTime: p,
      }
    }
    // SCROLL 50% → 65%: MENTORS — Wall Run (Moment "Wahou")
    // Y: -7m → -5m (haut écran)
    else if (progress < 0.65) {
      const p = (progress - 0.50) / 0.15
      const height = -7 + p * 2
      
      return {
        position: [-2 + p * 1, height, -p],
        rotation: [0, 0.6, 0],
        anim: 'wallRun',
        animTime: p,
      }
    }
    // SCROLL 65% → 80%: SHOWCASE — Running Slide (Maîtrise)
    // Y: -5m → -8m (descente)
    else if (progress < 0.80) {
      const p = (progress - 0.65) / 0.15
      const height = -5 - p * 3
      
      return {
        position: [-1 + p * 3, height, -1 + p * 2],
        rotation: [0, 0.2, 0],
        anim: 'slide',
        animTime: p,
      }
    }
    // SCROLL 80% → 100%: FOOTER → Victory (Conclusion)
    // Y: -9m (centre bas)
    else {
      const p = (progress - 0.80) / 0.20
      const animPhase = p < 0.6 ? 'roll' : 'victory'
      const animTime = p < 0.6 ? p / 0.6 : (p - 0.6) / 0.4
      
      return {
        position: [2 - p * 0.5, -9, 1 - p * 1.5],
        rotation: [0, -0.3 - p * 0.3, 0],
        anim: animPhase as AnimationName,
        animTime,
      }
    }
  }
  
  const state = getCharacterState(scrollProgress)
  
  // ============================================
  // UPDATE LOOP - PROTOCOLE DE FLUIDITÉ
  // ============================================
  useFrame((frameState, delta) => {
    if (!groupRef.current || !mixerRef.current) return
    
    // Update mixer
    mixerRef.current.update(delta)
    
    // Smooth position transition (lerp 0.08 pour plus de fluidité)
    const lerpFactor = 0.08
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      state.position[0],
      lerpFactor
    )
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      state.position[1],
      lerpFactor
    )
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      state.position[2],
      lerpFactor
    )
    
    // Smooth rotation avec momentum angulaire
    const currentRot = groupRef.current.rotation.y
    const targetRot = state.rotation[1]
    const deltaRot = targetRot - currentRot
    groupRef.current.rotation.y += deltaRot * lerpFactor
    
    // ============================================
    // GESTION DES TRANSITIONS - ANTI-POP
    // ============================================
    if (
      state.anim !== prevAnimRef.current &&
      frameState.clock.elapsedTime - transitionAtRef.current > TRANSITION_COOLDOWN
    ) {
      const prevAction = actionsRef.current[prevAnimRef.current]
      const nextAction = actionsRef.current[state.anim]
      
      if (prevAction && nextAction) {
        const prevName = prevAnimRef.current
        const nextName = state.anim
        const syncKey = `${prevName}.${nextName}`
        const syncPoint = SYNC_POINTS[syncKey]
        const isCompatible = POSE_COMPATIBILITY[prevName]?.includes(nextName)
        const crossfadeDuration = isCompatible ? CROSSFADE_DURATION : CROSSFADE_DURATION + 0.15

        if (syncPoint !== undefined) {
          const prevClipDuration = prevAction.getClip().duration
          prevAction.time = THREE.MathUtils.clamp(syncPoint * prevClipDuration, 0, prevClipDuration - 0.001)
        }

        const entryOffset = ENTRY_OFFSETS[nextName] ?? 0
        nextAction.reset()
        nextAction.enabled = true
        nextAction.time = nextAction.getClip().duration * entryOffset
        nextAction.play()
        prevAction.crossFadeTo(nextAction, crossfadeDuration, true)
        
      } else if (nextAction) {
        nextAction.reset().play()
      }
      
      transitionAtRef.current = frameState.clock.elapsedTime
      prevAnimRef.current = state.anim
    }
    
    // ============================================
    // TIME DILATION CIBLÉ
    // ============================================
    const actionName = state.anim
    const action = actionsRef.current[actionName]
    if (action && action.getClip()) {
      const config = ANIMATION_CONFIG[actionName]
      const clipDuration = action.getClip().duration

      let normalizedTime = state.animTime * (config?.speed ?? 1)
      if (config?.loop) {
        normalizedTime = normalizedTime % 1
      } else {
        normalizedTime = THREE.MathUtils.clamp(normalizedTime, 0, 0.999)
      }

      action.time = normalizedTime * clipDuration
    }
  })
  
  // ============================================
  // RENDER
  // ============================================
  if (isLoading || !model) {
    return null
  }
  
  return (
    <group ref={groupRef} scale={0.025} position={[0, -6, 0]}>
      <primitive object={model} />
    </group>
  )
}

// ============================================
// CAMÉRA DYNAMIQUE
// ============================================
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()
  const rigRef = useRef<CameraRig>(CAMERA_RIG.hero)
  
  useFrame(() => {
    // Déterminer le rig actif selon le scroll
    let targetRig = CAMERA_RIG.hero
    if (scrollProgress > 0.15 && scrollProgress < 0.50) {
      targetRig = CAMERA_RIG.sprint
    } else if (scrollProgress >= 0.50 && scrollProgress < 0.65) {
      targetRig = CAMERA_RIG.wallRun
    } else if (scrollProgress >= 0.65 && scrollProgress < 0.80) {
      targetRig = CAMERA_RIG.slide
    }
    
    // Lerp smooth vers le nouveau rig
    rigRef.current.position[0] = THREE.MathUtils.lerp(rigRef.current.position[0], targetRig.position[0], 0.05)
    rigRef.current.position[1] = THREE.MathUtils.lerp(rigRef.current.position[1], targetRig.position[1], 0.05)
    rigRef.current.position[2] = THREE.MathUtils.lerp(rigRef.current.position[2], targetRig.position[2], 0.05)
    
    const newFov = THREE.MathUtils.lerp(rigRef.current.fov, targetRig.fov, 0.05)
    rigRef.current = { ...rigRef.current, fov: newFov }
    
    camera.position.set(
      rigRef.current.position[0],
      rigRef.current.position[1],
      rigRef.current.position[2]
    )
    camera.lookAt(targetRig.lookAt[0], targetRig.lookAt[1], targetRig.lookAt[2])
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = rigRef.current.fov
      camera.updateProjectionMatrix()
    }
  })
  
  return null
}

// ============================================
// PARTICULES AMBIANTES
// ============================================
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

// ============================================
// CANVAS PRINCIPAL
// ============================================
export default function MixamoCharacterCanvas({ onModelLoaded }: { onModelLoaded?: () => void }) {
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
        
        {/* Character */}
        <Suspense fallback={null}>
          <MixamoCharacter scrollProgress={scrollProgress} onLoaded={onModelLoaded} />
        </Suspense>
        
        {/* Dynamic Camera */}
        <CameraController scrollProgress={scrollProgress} />
        
        {/* Particles */}
        <Particles />
      </Canvas>
    </div>
  )
}
