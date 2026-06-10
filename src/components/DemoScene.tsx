import { useRef, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore, LEVELS } from '../store/gameStore'
import { Crystal } from './Crystal'
import { SoundSystem } from '../systems/SoundSystem'

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

const RECYCLABLES = ['plastic_bottle', 'aluminum_can', 'paper', 'cardboard', 'container']
const HAZARDOUS   = ['used_battery', 'battery', 'toxic_waste', 'chemical']

const getRandomWasteTypeForLevel = (pctRecyclable: number): string => {
    if (Math.random() > pctRecyclable) {
        return HAZARDOUS[Math.floor(Math.random() * HAZARDOUS.length)]
    }
    return RECYCLABLES[Math.floor(Math.random() * RECYCLABLES.length)]
}

// Componente interno con acceso a la cámara y renderizador de Three.js
function DemoSceneInner({ targets, setTargets, setLabels }: {
    targets: TargetData[]
    setTargets: React.Dispatch<React.SetStateAction<TargetData[]>>
    setLabels: React.Dispatch<React.SetStateAction<FloatingLabel[]>>
}) {
    const { camera, gl } = useThree()
    const { level, recycleItem, hitHazardous, gameState } = useGameStore()
    const raycaster = useRef(new THREE.Raycaster())

    const addLabel = (text: string, color: string) => {
        const id = Date.now() + Math.random()
        setLabels(prev => [...prev, { id, text, color }])
        setTimeout(() => setLabels(prev => prev.filter(l => l.id !== id)), 1200)
    }

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (gameState !== 'playing') return
            SoundSystem.init()
            SoundSystem.play('shoot') // EcoScanner pulso de energía

            const rect = gl.domElement.getBoundingClientRect()
            const mouse = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            )
            raycaster.current.setFromCamera(mouse, camera)

            // Buscar el residuo más cercano en el trayecto del rayo
            let hitTarget: TargetData | null = null
            let minDist = Infinity

            targets.forEach(t => {
                const tPos = new THREE.Vector3(...t.position)
                const distToRay = raycaster.current.ray.distanceToPoint(tPos)
                if (distToRay < t.radius + 0.22 && raycaster.current.ray.origin.distanceTo(tPos) < minDist) {
                    hitTarget = t
                    minDist = raycaster.current.ray.origin.distanceTo(tPos)
                }
            })

            if (hitTarget) {
                const t = hitTarget as TargetData
                
                // Disparar lógica de recolección en el Store
                if (HAZARDOUS.includes(t.type)) {
                    hitHazardous(t.type)
                    SoundSystem.play('bomb') // Fallo/Alerta
                    addLabel('Residuo peligroso', '#f87171')
                } else {
                    recycleItem(t.type)
                    SoundSystem.play('hit') // Éxito ecológico
                    addLabel('+100 Reciclado', '#4ade80')
                }

                // Filtrar el residuo y reponer inmediatamente uno nuevo
                setTargets(prev => {
                    const remaining = prev.filter(x => x.id !== t.id)
                    const levelConfig = LEVELS[level - 1]
                    const max = levelConfig ? levelConfig.maxTargets : 8
                    const pctRec = levelConfig ? levelConfig.pctRecyclable : 0.90
                    
                    const needed = max - remaining.length
                    const replenished: TargetData[] = []
                    
                    for (let k = 0; k < needed; k++) {
                        replenished.push({
                            id: Date.now() + Math.random() + k,
                            position: [
                                (Math.random() - 0.5) * 7,
                                0.5 + Math.random() * 2,
                                (Math.random() - 0.5) * 7
                            ] as [number, number, number],
                            type: getRandomWasteTypeForLevel(pctRec),
                            radius: 0.18
                        })
                    }
                    return [...remaining, ...replenished]
                })
            }
        }

        gl.domElement.addEventListener('click', handleClick)
        return () => gl.domElement.removeEventListener('click', handleClick)
    }, [camera, gl, targets, gameState, level, recycleItem, hitHazardous])

    return (
        <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <pointLight position={[-5, 5, -5]} intensity={0.6} color="#10b981" />

            {/* Suelo plano translúcido */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#0f2417" transparent opacity={0.6} />
            </mesh>

            {/* Rejilla de apoyo visual */}
            <gridHelper args={[20, 20, '#1a3a2a', '#1a3a2a']} position={[0, -0.49, 0]} />

            {targets.map(t => (
                <Crystal key={t.id} position={t.position} type={t.type} />
            ))}

            <OrbitControls
                enablePan={false}
                minDistance={1.5}
                maxDistance={8}
                maxPolarAngle={Math.PI * 0.85}
                target={[0, 1, 0]}
            />
        </>
    )
}

// Wrapper del modo demostración
export function DemoScene() {
    const { gameState, level } = useGameStore()
    const [targets, setTargets] = useState<TargetData[]>([])
    const [labels, setLabels] = useState<FloatingLabel[]>([])

    // Generar residuos al iniciar o cambiar de nivel
    useEffect(() => {
        if (gameState === 'playing') {
            const levelConfig = LEVELS[level - 1]
            const max = levelConfig ? levelConfig.maxTargets : 8
            const pctRec = levelConfig ? levelConfig.pctRecyclable : 0.90

            const newTargets = Array.from({ length: max }).map((_, i) => ({
                id: i,
                position: [
                    (Math.random() - 0.5) * 7,
                    0.5 + Math.random() * 2,
                    (Math.random() - 0.5) * 7
                ] as [number, number, number],
                type: getRandomWasteTypeForLevel(pctRec),
                radius: 0.18
            }))
            setTargets(newTargets)
            setLabels([])
        }
    }, [gameState, level])

    if (gameState === 'menu' || gameState === 'level_intro') {
        return (
            <div className="demo-overlay">
                <div className="demo-banner glass">
                    <span className="demo-badge">🖥️ MODO DEMO — SIN REALIDAD AUMENTADA</span>
                    <p>Usa el <strong>mouse</strong> para rotar la vista y haz <strong>clic izquierdo</strong> sobre los residuos para capturarlos con el EcoScanner 3000.</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: 'radial-gradient(circle at center, #0d2218 0%, #050d0a 100%)' }}>
            {/* Banner superior de instrucciones */}
            <div className="demo-banner-inline glass">
                <span>🖥️ MODO DEMO ACTIVO</span>
                <span className="demo-hint">Arrastra para rotar · Clic para recolectar</span>
            </div>

            {/* Capa de textos flotantes de impacto (Overlay 2D) */}
            <div className="demo-labels-layer">
                {labels.map(l => (
                    <div key={l.id} className="demo-impact-label" style={{ color: l.color }}>
                        {l.text}
                    </div>
                ))}
            </div>

            <Canvas camera={{ position: [0, 2, 5], fov: 65 }}>
                <DemoSceneInner
                    targets={targets}
                    setTargets={setTargets}
                    setLabels={setLabels}
                />
            </Canvas>
        </div>
    )
}
