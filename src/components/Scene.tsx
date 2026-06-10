import { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useGameStore, LEVELS } from '../store/gameStore'
import { Bullet } from './Bullet'
import { Crystal } from './Crystal'
import { Radar } from './Radar'
import { SoundSystem } from '../systems/SoundSystem'

interface BulletData {
    id: number
    position: THREE.Vector3
    direction: THREE.Vector3
    createTime: number
}

interface TargetData {
    id: number
    position: [number, number, number]
    type: string // Representa el WasteType
    radius: number
}

interface FloatingText {
    id: number
    position: [number, number, number]
    text: string
    color: string
}

const RECYCLABLES = ['plastic_bottle', 'aluminum_can', 'paper', 'cardboard', 'container']
const HAZARDOUS = ['used_battery', 'battery', 'toxic_waste', 'chemical']

const getRandomWasteTypeForLevel = (pctRecyclable: number): string => {
    if (Math.random() > pctRecyclable) {
        return HAZARDOUS[Math.floor(Math.random() * HAZARDOUS.length)]
    }
    return RECYCLABLES[Math.floor(Math.random() * RECYCLABLES.length)]
}

export function Scene() {
    const { camera } = useThree()
    const { level, recycleItem, hitHazardous, gameState } = useGameStore()

    // Referencias para la física
    const bulletsRef = useRef<BulletData[]>([])

    // Estados de React
    const [bullets, setBullets] = useState<BulletData[]>([])
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
    const [targets, setTargets] = useState<TargetData[]>([])

    // Generar nuevos residuos al iniciar/reiniciar el nivel correspondiente
    useEffect(() => {
        if (gameState === 'playing') {
            setFloatingTexts([])
            setBullets([])
            bulletsRef.current = []

            const levelConfig = LEVELS[level - 1]
            const max = levelConfig ? levelConfig.maxTargets : 8
            const pctRec = levelConfig ? levelConfig.pctRecyclable : 0.90

            // Generamos residuos distribuidos en una esfera alrededor del usuario
            const newTargets = Array.from({ length: max }).map((_, i) => {
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos((Math.random() * 2) - 1)
                const distance = 2.5 + Math.random() * 2.5 // Entre 2.5m y 5m
                
                return {
                    id: i,
                    position: [
                        distance * Math.sin(phi) * Math.cos(theta),
                        Math.max(0.2, 1.2 + 1.2 * Math.cos(phi)), // Altura jugable cómoda
                        distance * Math.sin(phi) * Math.sin(theta)
                    ] as [number, number, number],
                    type: getRandomWasteTypeForLevel(pctRec),
                    radius: 0.18
                }
            })
            setTargets(newTargets)
        }
    }, [gameState, level])

    // Agregar un texto flotante temporal en la posición 3D de la recolección
    const addFloatingText = (pos: [number, number, number], text: string, color: string) => {
        const id = Date.now() + Math.random()
        setFloatingTexts(prev => [...prev, { id, position: pos, text, color }])
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(ft => ft.id !== id))
        }, 1200) // Se desvanece a los 1.2 segundos
    }

    // Manejar el disparo (toque en pantalla)
    useEffect(() => {
        const handleTouch = () => {
            if (gameState !== 'playing') return

            SoundSystem.init() // Asegurar contexto de audio
            SoundSystem.play('shoot') // EcoScanner sonido de pulso

            const startPos = camera.position.clone()

            // Dirección a la que apunta la cámara
            const direction = new THREE.Vector3()
            camera.getWorldDirection(direction)

            const newBullet: BulletData = {
                id: Date.now() + Math.random(),
                position: startPos,
                direction: direction,
                createTime: performance.now()
            }

            setBullets(prev => [...prev, newBullet])
            bulletsRef.current.push(newBullet)
        }

        window.addEventListener('click', handleTouch)
        return () => window.removeEventListener('click', handleTouch)
    }, [camera, gameState])

    // Bucle de Física y Colisiones (useFrame)
    useFrame((_, delta) => {
        if (gameState !== 'playing') return

        const now = performance.now()
        const bulletSpeed = 16 // m/s (velocidad del haz de escaneo)

        // 1. Mover los pulsos de escaneo
        bulletsRef.current.forEach(b => {
            b.position.add(b.direction.clone().multiplyScalar(bulletSpeed * delta))
        })

        // 2. Colisiones e inactividad por tiempo
        const bulletsToRemove: number[] = []
        const targetsToRemove: number[] = []

        // Descartar pulsos con más de 1.8 segundos de vida
        bulletsRef.current.forEach(b => {
            if (now - b.createTime > 1800) {
                bulletsToRemove.push(b.id)
            }
        })

        bulletsRef.current.forEach(b => {
            if (bulletsToRemove.includes(b.id)) return

            targets.forEach(t => {
                if (targetsToRemove.includes(t.id)) return

                const dist = b.position.distanceTo(new THREE.Vector3(...t.position))
                // Margen de colisión
                if (dist < (t.radius + 0.12)) {
                    bulletsToRemove.push(b.id)
                    targetsToRemove.push(t.id)

                    const isHazardous = HAZARDOUS.includes(t.type)
                    if (isHazardous) {
                        hitHazardous(t.type)
                        SoundSystem.play('bomb') // Alerta de error
                        addFloatingText(t.position, "Residuo peligroso", "#f87171")
                    } else {
                        recycleItem(t.type)
                        SoundSystem.play('hit') // Sonido ecológico/amigable
                        addFloatingText(t.position, "+100 Reciclado", "#4ade80")
                    }
                }
            })
        })

        // 3. Procesar eliminación y REPOSICIÓN CONTINUA de residuos
        if (targetsToRemove.length > 0) {
            setTargets(prev => {
                const remainingTargets = prev.filter(t => !targetsToRemove.includes(t.id))
                
                const levelConfig = LEVELS[level - 1]
                const max = levelConfig ? levelConfig.maxTargets : 8
                const pctRec = levelConfig ? levelConfig.pctRecyclable : 0.90
                
                // Reponer residuos para mantener siempre el total máximo de residuos del nivel
                const needed = max - remainingTargets.length
                const replenished: TargetData[] = []

                for (let k = 0; k < needed; k++) {
                    const theta = Math.random() * Math.PI * 2
                    const phi = Math.acos((Math.random() * 2) - 1)
                    const distance = 2.5 + Math.random() * 2.5

                    replenished.push({
                        id: Date.now() + Math.random() + k,
                        position: [
                            distance * Math.sin(phi) * Math.cos(theta),
                            Math.max(0.2, 1.2 + 1.2 * Math.cos(phi)),
                            distance * Math.sin(phi) * Math.sin(theta)
                        ] as [number, number, number],
                        type: getRandomWasteTypeForLevel(pctRec),
                        radius: 0.18
                    })
                }

                return [...remainingTargets, ...replenished]
            })
        }

        // 4. Procesar eliminación de pulsos de escaneo
        if (bulletsToRemove.length > 0) {
            setBullets(prev => prev.filter(b => !bulletsToRemove.includes(b.id)))
            bulletsRef.current = bulletsRef.current.filter(b => !bulletsToRemove.includes(b.id))
        }
    })

    return (
        <>
            <ambientLight intensity={0.65} />
            <directionalLight position={[5, 10, 3]} intensity={1.5} />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />

            {/* Residuos activos */}
            {targets.map(t => (
                <Crystal key={t.id} position={t.position} type={t.type} />
            ))}

            {/* Haz de escaneo */}
            {bullets.map(b => (
                <Bullet
                    key={b.id}
                    position={b.position}
                    direction={b.direction}
                />
            ))}

            {/* Textos de impacto flotantes 3D */}
            {floatingTexts.map(ft => (
                <Html key={ft.id} position={ft.position} center>
                    <div className="floating-bubble-text" style={{ color: ft.color }}>
                        {ft.text}
                    </div>
                </Html>
            ))}

            {/* Radar detector ambiental */}
            <Radar targets={targets} />
        </>
    )
}
