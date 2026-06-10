import { useRef, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { Crystal } from './Crystal'
import { SoundSystem } from '../systems/SoundSystem'

const RECYCLABLES = ['plastic_bottle', 'aluminum_can', 'paper', 'cardboard', 'container']
const HAZARDOUS   = ['used_battery', 'battery', 'toxic_waste', 'chemical']
const getRandomWasteType = () =>
    Math.random() > 0.75
        ? HAZARDOUS[Math.floor(Math.random() * HAZARDOUS.length)]
        : RECYCLABLES[Math.floor(Math.random() * RECYCLABLES.length)]

interface TargetData {
    id: number
    position: [number, number, number]
    type: string
    radius: number
}

interface FloatingLabel {
    id: number
    text: string
    color: string
}

// Componente interno con acceso a la cámara Three.js
function DemoSceneInner({ targets, setTargets, setLabels }: {
    targets: TargetData[]
    setTargets: React.Dispatch<React.SetStateAction<TargetData[]>>
    setLabels: React.Dispatch<React.SetStateAction<FloatingLabel[]>>
}) {
    const { camera, gl } = useThree()
    const { recycleItem, hitHazardous, gameState } = useGameStore()
    const raycaster = useRef(new THREE.Raycaster())

    const addLabel = (text: string, color: string) => {
        const id = Date.now() + Math.random()
        setLabels(prev => [...prev, { id, text, color }])
        setTimeout(() => setLabels(prev => prev.filter(l => l.id !== id)), 1800)
    }

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (gameState !== 'playing') return
            SoundSystem.init()
            SoundSystem.play('shoot')

            const rect = gl.domElement.getBoundingClientRect()
            const mouse = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            )
            raycaster.current.setFromCamera(mouse, camera)

            // Buscar el residuo más cercano en la dirección del rayo
            let hitTarget: TargetData | null = null
            let minDist = Infinity

            targets.forEach(t => {
                const tPos = new THREE.Vector3(...t.position)
                const distToRay = raycaster.current.ray.distanceToPoint(tPos)
                if (distToRay < t.radius + 0.25 && raycaster.current.ray.origin.distanceTo(tPos) < minDist) {
                    hitTarget = t
                    minDist = raycaster.current.ray.origin.distanceTo(tPos)
                }
            })

            if (hitTarget) {
                const t = hitTarget as TargetData
                setTargets(prev => prev.filter(x => x.id !== t.id))
                if (HAZARDOUS.includes(t.type)) {
                    hitHazardous(t.type)
                    SoundSystem.play('bomb')
                    addLabel('¡Residuo peligroso! (-500)', '#f87171')
                } else {
                    recycleItem(t.type)
                    SoundSystem.play('hit')
                    addLabel('Residuo reciclado (+100)', '#4ade80')
                }
            }
        }
        gl.domElement.addEventListener('click', handleClick)
        return () => gl.domElement.removeEventListener('click', handleClick)
    }, [camera, gl, targets, gameState, recycleItem, hitHazardous])

    return (
        <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <pointLight position={[-5, 5, -5]} intensity={0.6} color="#10b981" />

            {/* Suelo referencial */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#0f2417" transparent opacity={0.6} />
            </mesh>

            {/* Grid visual */}
            <gridHelper args={[20, 20, '#1a3a2a', '#1a3a2a']} position={[0, -0.49, 0]} />

            {targets.map(t => (
                <Crystal key={t.id} position={t.position} type={t.type} />
            ))}

            <OrbitControls
                enablePan={false}
                minDistance={1}
                maxDistance={8}
                maxPolarAngle={Math.PI * 0.85}
                target={[0, 1, 0]}
            />
        </>
    )
}

// Wrapper completo del modo demo
export function DemoScene() {
    const { gameState, endGame } = useGameStore()
    const [targets, setTargets] = useState<TargetData[]>([])
    const [labels, setLabels] = useState<FloatingLabel[]>([])

    useEffect(() => {
        if (gameState === 'playing') {
            const newTargets = Array.from({ length: 20 }).map((_, i) => ({
                id: i,
                position: [
                    (Math.random() - 0.5) * 8,
                    0.5 + Math.random() * 2,
                    (Math.random() - 0.5) * 8
                ] as [number, number, number],
                type: getRandomWasteType(),
                radius: 0.2
            }))
            setTargets(newTargets)
            setLabels([])
        }
    }, [gameState])

    // Verificar condición de victoria en modo demo
    useEffect(() => {
        if (gameState === 'playing' && targets.length > 0) {
            const remainingRecyclables = targets.filter(t => RECYCLABLES.includes(t.type)).length
            if (remainingRecyclables === 0) {
                endGame()
                SoundSystem.play('win')
            }
        }
    }, [targets, gameState, endGame])

    if (gameState === 'menu') {
        return (
            <div className="demo-overlay">
                <div className="demo-banner glass">
                    <span className="demo-badge">🖥️ MODO DEMO — SIN REALIDAD AUMENTADA</span>
                    <p>Usa el <strong>mouse</strong> para rotar la cámara y <strong>clic izquierdo</strong> para capturar los residuos. Ideal para demostrar en proyector o computadora.</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: 'radial-gradient(circle at center, #0d2218 0%, #050d0a 100%)' }}>
            {/* Banner modo demo siempre visible */}
            <div className="demo-banner-inline glass">
                <span>🖥️ MODO DEMO</span>
                <span className="demo-hint">Arrastra para rotar · Clic para capturar</span>
            </div>

            {/* Labels de impacto flotantes (overlay 2D) */}
            <div className="demo-labels-layer">
                {labels.map(l => (
                    <div key={l.id} className="demo-impact-label" style={{ color: l.color }}>
                        {l.text}
                    </div>
                ))}
            </div>

            <Canvas camera={{ position: [0, 2, 6], fov: 65 }}>
                <DemoSceneInner
                    targets={targets}
                    setTargets={setTargets}
                    setLabels={setLabels}
                />
            </Canvas>
        </div>
    )
}
