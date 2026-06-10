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
    velocity: [number, number, number]
    type: string
    radius: number
    isGolden?: boolean
    spawnTime?: number
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

const getRandomVelocityForLevel = (level: number): [number, number, number] => {
    let speed = 0
    if (level === 1) {
        speed = 0.04 + Math.random() * 0.04
    } else if (level === 2) {
        speed = 0.10 + Math.random() * 0.10
    } else if (level === 3) {
        speed = 0.25 + Math.random() * 0.20
    } else {
        speed = 0.55 + Math.random() * 0.40
    }

    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos((Math.random() * 2) - 1)

    return [
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta) * 0.4,
        speed * Math.cos(phi)
    ]
}

export function Scene() {
    const { camera } = useThree()
    const { 
        level, 
        recycleItem, 
        hitHazardous, 
        gameState, 
        bossActive, 
        bossHp, 
        hitBoss, 
        hasBeatenBoss 
    } = useGameStore()

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
                
                const type = getRandomWasteTypeForLevel(pctRec)
                const isRecyclable = RECYCLABLES.includes(type)
                const isGolden = isRecyclable && Math.random() < 0.10 // 10% chance
                
                return {
                    id: i,
                    position: [
                        distance * Math.sin(phi) * Math.cos(theta),
                        Math.max(0.2, 1.2 + 1.2 * Math.cos(phi)), // Altura jugable cómoda
                        distance * Math.sin(phi) * Math.sin(theta)
                    ] as [number, number, number],
                    velocity: getRandomVelocityForLevel(level),
                    type: type,
                    radius: 0.18,
                    isGolden: isGolden,
                    spawnTime: isGolden ? performance.now() : undefined
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

        // --- FÍSICA DE TRASLACIÓN DE RESIDUOS (MOVIMIENTO SEGÚN NIVEL) ---
        setTargets(prev => prev.map(t => {
            if (t.type === 'final_boss' || !t.velocity) return t

            let x = t.position[0] + t.velocity[0] * delta
            let y = t.position[1] + t.velocity[1] * delta
            let z = t.position[2] + t.velocity[2] * delta

            let vx = t.velocity[0]
            let vy = t.velocity[1]
            let vz = t.velocity[2]

            // Limitar en esfera alrededor del usuario
            const dist = Math.sqrt(x * x + y * y + z * z)
            if (dist > 5.5) {
                vx = -vx
                vy = -vy
                vz = -vz
                x = (x / dist) * 5.4
                y = (y / dist) * 5.4
                z = (z / dist) * 5.4
            } else if (dist < 1.2) {
                vx = -vx
                vy = -vy
                vz = -vz
                x = (x / dist) * 1.3
                y = (y / dist) * 1.3
                z = (z / dist) * 1.3
            }

            // Alturas cómodas de juego
            if (y < 0.2) {
                y = 0.2
                vy = Math.abs(vy)
            } else if (y > 3.0) {
                y = 3.0
                vy = -Math.abs(vy)
            }

            return {
                ...t,
                position: [x, y, z],
                velocity: [vx, vy, vz]
            }
        }))

        // --- GESTIÓN DEL JEFE FINAL ---
        // Si el jefe final se activa y no está en targets, agregarlo
        if (bossActive && !targets.some(t => t.type === 'final_boss') && !hasBeatenBoss) {
            setTargets(prev => [
                ...prev.filter(x => x.type !== 'final_boss'),
                {
                    id: 9999,
                    position: [0, 1.3, -3], // Central frente al usuario en AR
                    velocity: [0, 0, 0],
                    type: 'final_boss',
                    radius: 0.55
                }
            ])
        }

        // Si el jefe final ya no está activo pero sigue en targets (por ejemplo tras morir), removerlo
        if (!bossActive && targets.some(t => t.type === 'final_boss')) {
            setTargets(prev => prev.filter(t => t.type !== 'final_boss'))
        }

        // --- GESTIÓN DE RESIDUOS DORADOS EXPIRADOS ---
        // Desvanecer residuos dorados con más de 8 segundos sin escanear
        const expiredGoldenIds: number[] = []
        targets.forEach(t => {
            if (t.isGolden && now - (t.spawnTime || 0) > 8000) {
                expiredGoldenIds.push(t.id)
            }
        })

        if (expiredGoldenIds.length > 0) {
            setTargets(prev => {
                const remainingTargets = prev.filter(t => !expiredGoldenIds.includes(t.id))
                
                const levelConfig = LEVELS[level - 1]
                const max = levelConfig ? levelConfig.maxTargets : 8
                const pctRec = levelConfig ? levelConfig.pctRecyclable : 0.90
                
                // Reponer con residuos normales
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
                        velocity: getRandomVelocityForLevel(level),
                        type: getRandomWasteTypeForLevel(pctRec),
                        radius: 0.18,
                        isGolden: false // reemplazado por normal
                    })
                }

                return [...remainingTargets, ...replenished]
            })
        }

        // --- FÍSICA DE BALAS Y COLISIONES ---
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

                    if (t.type === 'final_boss') {
                        // Colisión con el Jefe
                        hitBoss(1)
                        SoundSystem.play('hit')
                        const nextHp = bossHp - 1
                        addFloatingText(t.position, `¡IMPACTO! HP: ${nextHp}/10`, "#c084fc")
                    } else {
                        // Colisión con residuo común
                        targetsToRemove.push(t.id)
                        const isHazardous = HAZARDOUS.includes(t.type)
                        if (isHazardous) {
                            hitHazardous(t.type)
                            SoundSystem.play('bomb') // Alerta de error
                            addFloatingText(t.position, "Residuo peligroso", "#f87171")
                        } else {
                            recycleItem(t.type, t.isGolden)
                            SoundSystem.play('hit') // Sonido ecológico/amigable

                            // Calcular el combo actual para el texto flotante
                            const currentMultiplier = useGameStore.getState().comboMultiplier
                            const text = t.isGolden
                                ? `¡DORADO! +${500 * currentMultiplier}`
                                : (currentMultiplier > 1 ? `Combo x${currentMultiplier}! +${100 * currentMultiplier}` : "+100 Reciclado")
                            const color = t.isGolden ? "#fbbf24" : (currentMultiplier > 1 ? "#38bdf8" : "#4ade80")

                            addFloatingText(t.position, text, color)
                        }
                    }
                }
            })
        })

        // 3. Procesar eliminación y REPOSICIÓN CONTINUA de residuos comunes
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

                    const type = getRandomWasteTypeForLevel(pctRec)
                    const isRecyclable = RECYCLABLES.includes(type)
                    const isGolden = isRecyclable && Math.random() < 0.10 // 10% chance

                    replenished.push({
                        id: Date.now() + Math.random() + k,
                        position: [
                            distance * Math.sin(phi) * Math.cos(theta),
                            Math.max(0.2, 1.2 + 1.2 * Math.cos(phi)),
                            distance * Math.sin(phi) * Math.sin(theta)
                        ] as [number, number, number],
                        velocity: getRandomVelocityForLevel(level),
                        type: type,
                        radius: 0.18,
                        isGolden: isGolden,
                        spawnTime: isGolden ? performance.now() : undefined
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
                <Crystal key={t.id} position={t.position} type={t.type} isGolden={t.isGolden} />
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
