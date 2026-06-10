import { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
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

// Generador aleatorio que prioriza residuos reciclables (~75%) frente a peligrosos (~25%)
const getRandomWasteType = (): string => {
    if (Math.random() > 0.75) {
        return HAZARDOUS[Math.floor(Math.random() * HAZARDOUS.length)]
    }
    return RECYCLABLES[Math.floor(Math.random() * RECYCLABLES.length)]
}

export function Scene() {
    const { camera } = useThree()
    const { recycleItem, hitHazardous, gameState, endGame } = useGameStore()

    // Referencias para la física
    const bulletsRef = useRef<BulletData[]>([])

    // Estados de React
    const [bullets, setBullets] = useState<BulletData[]>([])
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
    const [targets, setTargets] = useState<TargetData[]>([])

    // Generar nuevos residuos al iniciar/reiniciar la partida
    useEffect(() => {
        if (gameState === 'playing') {
            setFloatingTexts([])
            setBullets([])
            bulletsRef.current = []

            // Generamos 20 residuos distribuidos en una esfera alrededor del usuario
            const newTargets = Array.from({ length: 20 }).map((_, i) => {
                // Posicionar objetos en un radio de 2 a 5 metros alrededor del origen
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos((Math.random() * 2) - 1)
                const distance = 2.5 + Math.random() * 2.5 // Entre 2.5m y 5m
                
                return {
                    id: i,
                    position: [
                        distance * Math.sin(phi) * Math.cos(theta),
                        Math.max(0.2, 1.2 + 1.2 * Math.cos(phi)), // Altura jugable y cómoda (altura de la vista)
                        distance * Math.sin(phi) * Math.sin(theta)
                    ] as [number, number, number],
                    type: getRandomWasteType(),
                    radius: 0.18 // Radio de la colisión unificado
                }
            })
            setTargets(newTargets)
        }
    }, [gameState])

    // Agregar un texto flotante en la posición 3D del impacto
    const addFloatingText = (pos: [number, number, number], text: string, color: string) => {
        const id = Date.now() + Math.random()
        setFloatingTexts(prev => [...prev, { id, position: pos, text, color }])
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(ft => ft.id !== id))
        }, 1500)
    }

    // Manejar el disparo (toque en pantalla)
    useEffect(() => {
        const handleTouch = () => {
            if (gameState !== 'playing') return

            SoundSystem.init() // Inicializar el audio
            SoundSystem.play('shoot')

            const startPos = camera.position.clone()

            // Obtener dirección a la que apunta la cámara
            const direction = new THREE.Vector3()
            camera.getWorldDirection(direction)

            const newBullet: BulletData = {
                id: Date.now(),
                position: startPos,
                direction: direction,
                createTime: performance.now()
            }

            // Actualización para renderizado y físicas
            setBullets(prev => [...prev, newBullet])
            bulletsRef.current.push(newBullet)
        }

        window.addEventListener('click', handleTouch)
        return () => window.removeEventListener('click', handleTouch)
    }, [camera, gameState])

    // Bucle de Física y Colisiones (useFrame se ejecuta cada frame)
    useFrame((_, delta) => {
        if (gameState !== 'playing') return

        const now = performance.now()
        const bulletSpeed = 15

        // 1. Mover burbujas de captura
        bulletsRef.current.forEach(b => {
            b.position.add(b.direction.clone().multiplyScalar(bulletSpeed * delta))
        })

        // 2. Detección de colisiones e inactivación por tiempo de vida
        const bulletsToRemove: number[] = []
        const targetsToRemove: number[] = []

        // Descartar burbujas con más de 2 segundos de vida
        bulletsRef.current.forEach(b => {
            if (now - b.createTime > 2000) {
                bulletsToRemove.push(b.id)
            }
        })

        bulletsRef.current.forEach(b => {
            if (bulletsToRemove.includes(b.id)) return

            // Comprobar colisión contra cada residuo activo
            targets.forEach(t => {
                if (targetsToRemove.includes(t.id)) return

                const dist = b.position.distanceTo(new THREE.Vector3(...t.position))
                // Margen de colisión: radio del objeto + radio de la burbuja (aprox 0.1)
                if (dist < (t.radius + 0.1)) {
                    bulletsToRemove.push(b.id)
                    targetsToRemove.push(t.id)

                    const isHazardous = HAZARDOUS.includes(t.type)
                    if (isHazardous) {
                        // Penalización por residuo peligroso
                        hitHazardous(t.type)
                        SoundSystem.play('bomb')
                        addFloatingText(t.position, "Residuo peligroso (-500)", "#f87171")
                    } else {
                        // Puntos por reciclaje correcto
                        recycleItem(t.type)
                        SoundSystem.play('hit')
                        addFloatingText(t.position, "Residuo reciclado (+100)", "#4ade80")
                    }
                }
            })
        })

        // 3. Procesar las eliminaciones de residuos colisionados
        if (targetsToRemove.length > 0) {
            setTargets(prev => {
                const newTargets = prev.filter(t => !targetsToRemove.includes(t.id))
                
                // Condición de victoria: no quedan residuos reciclables
                const remainingRecyclables = newTargets.filter(t => RECYCLABLES.includes(t.type)).length
                if (remainingRecyclables === 0) {
                    endGame()
                    SoundSystem.play('win')
                }
                return newTargets
            })
        }

        // 4. Procesar las eliminaciones de burbujas usadas o vencidas
        if (bulletsToRemove.length > 0) {
            setBullets(prev => prev.filter(b => !bulletsToRemove.includes(b.id)))
            bulletsRef.current = bulletsRef.current.filter(b => !bulletsToRemove.includes(b.id))
        }
    })

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 3]} intensity={1.5} />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />

            {/* Renderizar los residuos activos en pantalla */}
            {targets.map(t => (
                <Crystal key={t.id} position={t.position} type={t.type} />
            ))}

            {/* Renderizar burbujas de captura en vuelo */}
            {bullets.map(b => (
                <Bullet
                    key={b.id}
                    position={b.position}
                    direction={b.direction}
                />
            ))}

            {/* Textos flotantes 3D de recolección */}
            {floatingTexts.map(ft => (
                <Html key={ft.id} position={ft.position} center>
                    <div className="floating-bubble-text" style={{ color: ft.color }}>
                        {ft.text}
                    </div>
                </Html>
            ))}

            {/* Radar / Detector Ambiental */}
            <Radar targets={targets} />
        </>
    )
}
