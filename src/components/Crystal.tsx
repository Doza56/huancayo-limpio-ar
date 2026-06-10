import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CrystalProps {
    position: [number, number, number]
    type: string // Representa el WasteType (plastic_bottle, aluminum_can, etc. o 'final_boss')
    isGolden?: boolean
}

export function Crystal({ position, type, isGolden = false }: CrystalProps) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (groupRef.current) {
            const isBoss = type === 'final_boss'
            
            // Si es el jefe final, rota más lento e imponente, sin inclinación extra en Z
            if (isBoss) {
                groupRef.current.rotation.y += delta * 0.4
                groupRef.current.rotation.x = 0.05 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.04
            } else {
                // Rotación e inclinación estándar para residuos flotantes
                const rotMultiplier = isGolden ? 1.5 : 1.0 // Los dorados giran más rápido
                groupRef.current.rotation.y += delta * 0.7 * rotMultiplier
                groupRef.current.rotation.z += delta * 0.15 * rotMultiplier
                groupRef.current.rotation.x = 0.1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1
                
                // Animación de flotado vertical (Bobbing) suave
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.3 + position[0]) * 0.07
            }
        }
    })

    // Función auxiliar para obtener las propiedades del material dinámicamente.
    // Si el residuo es dorado, se anulan los colores originales y se aplica un oro metálico pulido.
    const getMatProps = (
        color: string, 
        metal: number = 0, 
        rough: number = 0.5, 
        trans: boolean = false, 
        op: number = 1, 
        emissiveColor?: string, 
        emissiveInt: number = 0
    ) => {
        if (isGolden) {
            return {
                color: "#fbbf24",
                metalness: 0.98,
                roughness: 0.05,
                emissive: new THREE.Color("#d97706"),
                emissiveIntensity: 0.45
            }
        }
        return {
            color: color,
            metalness: metal,
            roughness: rough,
            transparent: trans,
            opacity: op,
            emissive: emissiveColor ? new THREE.Color(emissiveColor) : undefined,
            emissiveIntensity: emissiveInt
        }
    }

    // Construcción de los modelos 3D procedurales optimizados
    const renderModel = () => {
        switch (type) {
            // --- RESIDUOS RECICLABLES ---
            case 'plastic_bottle':
                return (
                    <group>
                        {/* Cuerpo de la botella */}
                        <mesh position={[0, -0.02, 0]}>
                            <cylinderGeometry args={[0.06, 0.06, 0.18, 12]} />
                            <meshStandardMaterial {...getMatProps("#a5f3fc", 0.1, 0.1, true, 0.6)} />
                        </mesh>
                        {/* Hombro de la botella */}
                        <mesh position={[0, 0.08, 0]}>
                            <cylinderGeometry args={[0.03, 0.06, 0.04, 12]} />
                            <meshStandardMaterial {...getMatProps("#a5f3fc", 0, 0.1, true, 0.6)} />
                        </mesh>
                        {/* Cuello de la botella */}
                        <mesh position={[0, 0.115, 0]}>
                            <cylinderGeometry args={[0.03, 0.03, 0.03, 10]} />
                            <meshStandardMaterial {...getMatProps("#a5f3fc", 0, 0.1, true, 0.6)} />
                        </mesh>
                        {/* Tapa azul */}
                        <mesh position={[0, 0.135, 0]}>
                            <cylinderGeometry args={[0.035, 0.035, 0.015, 10]} />
                            <meshStandardMaterial {...getMatProps("#0284c7", 0, 0.4)} />
                        </mesh>
                    </group>
                )
            case 'aluminum_can':
                return (
                    <group>
                        {/* Cuerpo metálico plateado */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.065, 0.065, 0.16, 12]} />
                            <meshStandardMaterial {...getMatProps("#cbd5e1", 0.9, 0.2)} />
                        </mesh>
                        {/* Borde metálico superior */}
                        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.06, 0.007, 8, 16]} />
                            <meshStandardMaterial {...getMatProps("#94a3b8", 0.8, 0.2)} />
                        </mesh>
                        {/* Borde metálico inferior */}
                        <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.06, 0.007, 8, 16]} />
                            <meshStandardMaterial {...getMatProps("#94a3b8", 0.8, 0.2)} />
                        </mesh>
                        {/* Anilla abre fácil en el tope */}
                        <mesh position={[0.015, 0.082, 0]}>
                            <boxGeometry args={[0.02, 0.002, 0.035]} />
                            <meshStandardMaterial {...getMatProps("#94a3b8", 0.9, 0.2)} />
                        </mesh>
                    </group>
                )
            case 'paper':
                return (
                    <group>
                        {/* Dos hojas de papel dobladas e inclinadas */}
                        <mesh position={[0, 0, 0]} rotation={[0.3, 0.2, 0.5]}>
                            <boxGeometry args={[0.13, 0.002, 0.18]} />
                            <meshStandardMaterial {...getMatProps("#ffffff", 0, 0.9)} />
                        </mesh>
                        {/* Esquina doblada para simular papel usado */}
                        <mesh position={[0.045, 0.002, 0.07]} rotation={[0.3, 0.2, -0.6]}>
                            <boxGeometry args={[0.04, 0.0025, 0.04]} />
                            <meshStandardMaterial {...getMatProps("#e2e8f0", 0, 0.95)} />
                        </mesh>
                        <mesh position={[-0.01, -0.005, 0.01]} rotation={[-0.2, 0.4, 0.1]}>
                            <boxGeometry args={[0.12, 0.0018, 0.17]} />
                            <meshStandardMaterial {...getMatProps("#f8fafc", 0, 0.95)} />
                        </mesh>
                    </group>
                )
            case 'cardboard':
                return (
                    <group>
                        {/* Caja de cartón marrón principal */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.18, 0.15, 0.18]} />
                            <meshStandardMaterial {...getMatProps("#d97706", 0, 0.9)} />
                        </mesh>
                        {/* Solapas superiores parcialmente abiertas (lado A) */}
                        <mesh position={[-0.08, 0.085, 0]} rotation={[0, 0, 0.2]}>
                            <boxGeometry args={[0.05, 0.002, 0.18]} />
                            <meshStandardMaterial {...getMatProps("#b45309", 0, 0.9)} />
                        </mesh>
                        {/* Solapas superiores parcialmente abiertas (lado B) */}
                        <mesh position={[0.08, 0.085, 0]} rotation={[0, 0, -0.2]}>
                            <boxGeometry args={[0.05, 0.002, 0.18]} />
                            <meshStandardMaterial {...getMatProps("#b45309", 0, 0.9)} />
                        </mesh>
                        {/* Cinta de embalaje adhesiva */}
                        <mesh position={[0, 0.001, 0.091]}>
                            <boxGeometry args={[0.03, 0.14, 0.002]} />
                            <meshStandardMaterial {...getMatProps("#78350f", 0, 0.5)} />
                        </mesh>
                    </group>
                )
            case 'container':
                return (
                    <group>
                        {/* Envase de cartón de jugo/leche (Tetra Pak) */}
                        <mesh position={[0, -0.03, 0]}>
                            <boxGeometry args={[0.11, 0.16, 0.11]} />
                            <meshStandardMaterial {...getMatProps("#f1f5f9", 0, 0.4)} />
                        </mesh>
                        {/* Franjas decorativas reciclables */}
                        <mesh position={[0, -0.03, 0.056]}>
                            <boxGeometry args={[0.08, 0.04, 0.002]} />
                            <meshStandardMaterial {...getMatProps("#22c55e", 0, 0.5)} />
                        </mesh>
                        {/* Tapa cónica inclinada superior */}
                        <mesh position={[0, 0.07, 0]} rotation={[0, Math.PI / 4, 0]}>
                            <coneGeometry args={[0.085, 0.04, 4]} />
                            <meshStandardMaterial {...getMatProps("#e2e8f0", 0, 0.4)} />
                        </mesh>
                        {/* Pico/Rosca vertedora */}
                        <mesh position={[0.02, 0.085, 0.02]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                            <meshStandardMaterial {...getMatProps("#10b981", 0, 0.5)} />
                        </mesh>
                    </group>
                )

            // --- RESIDUOS CONTAMINANTES / PELIGROSOS ---
            case 'used_battery':
                return (
                    <group>
                        {/* Pila: Cuerpo negro principal */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.045, 0.045, 0.15, 12]} />
                            <meshStandardMaterial {...getMatProps("#18181b", 0.5, 0.3)} />
                        </mesh>
                        {/* Anillo de advertencia amarillo cobre */}
                        <mesh position={[0, 0.02, 0]}>
                            <cylinderGeometry args={[0.046, 0.046, 0.06, 12]} />
                            <meshStandardMaterial {...getMatProps("#fbbf24", 0.4, 0.3)} />
                        </mesh>
                        {/* Terminal superior cobre */}
                        <mesh position={[0, 0.08, 0]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.015, 8]} />
                            <meshStandardMaterial {...getMatProps("#ea580c", 0.9, 0.1)} />
                        </mesh>
                        {/* Base metálica inferior */}
                        <mesh position={[0, -0.08, 0]}>
                            <cylinderGeometry args={[0.045, 0.045, 0.01, 12]} />
                            <meshStandardMaterial {...getMatProps("#64748b", 0.8, 0.2)} />
                        </mesh>
                    </group>
                )
            case 'battery':
                return (
                    <group>
                        {/* Batería rectangular negra */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.15, 0.12, 0.09]} />
                            <meshStandardMaterial {...getMatProps("#09090b", 0, 0.4)} />
                        </mesh>
                        {/* Franja de peligro amarilla */}
                        <mesh position={[0, 0, 0.046]}>
                            <boxGeometry args={[0.12, 0.02, 0.002]} />
                            <meshStandardMaterial {...getMatProps("#eab308", 0, 0.5)} />
                        </mesh>
                        {/* Bornes visibles */}
                        <mesh position={[-0.04, 0.07, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
                            <meshStandardMaterial {...getMatProps("#ef4444", 0.8, 0.2)} /> {/* Positivo Rojo */}
                        </mesh>
                        <mesh position={[0.04, 0.07, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
                            <meshStandardMaterial {...getMatProps("#cbd5e1", 0.8, 0.2)} /> {/* Negativo Gris */}
                        </mesh>
                    </group>
                )
            case 'toxic_waste':
                return (
                    <group>
                        {/* Bidón rojo de residuos peligrosos */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.09, 0.09, 0.22, 12]} />
                            <meshStandardMaterial {...getMatProps("#dc2626", 0.2, 0.4)} />
                        </mesh>
                        {/* Anillos del bidón en negro */}
                        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.091, 0.008, 8, 16]} />
                            <meshStandardMaterial {...getMatProps("#111111", 0, 0.6)} />
                        </mesh>
                        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.091, 0.008, 8, 16]} />
                            <meshStandardMaterial {...getMatProps("#111111", 0, 0.6)} />
                        </mesh>
                        {/* Símbolo de advertencia ambiental (rombo amarillo) */}
                        <mesh position={[0, 0, 0.091]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.045, 0.045, 0.002]} />
                            <meshStandardMaterial {...getMatProps("#fbbf24", 0, 0.5, false, 1, "#fbbf24", 0.6)} />
                        </mesh>
                        {/* Detalle interno negro en el rombo */}
                        <mesh position={[0, 0, 0.093]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.025, 0.025, 0.002]} />
                            <meshStandardMaterial {...getMatProps("#000000", 0, 0.5)} />
                        </mesh>
                    </group>
                )
            case 'chemical':
                return (
                    <group>
                        {/* Frasco químico naranja de laboratorio */}
                        <mesh position={[0, -0.03, 0]}>
                            <coneGeometry args={[0.095, 0.12, 10]} />
                            <meshStandardMaterial {...getMatProps("#ea580c", 0, 0.1, true, 0.8, "#7c2d12", 0.3)} />
                        </mesh>
                        {/* Cuello del matraz */}
                        <mesh position={[0, 0.05, 0]}>
                            <cylinderGeometry args={[0.024, 0.024, 0.05, 10]} />
                            <meshStandardMaterial {...getMatProps("#ea580c", 0, 0.1, true, 0.8)} />
                        </mesh>
                        {/* Tapón negro */}
                        <mesh position={[0, 0.078, 0]}>
                            <cylinderGeometry args={[0.028, 0.028, 0.015, 8]} />
                            <meshStandardMaterial {...getMatProps("#18181b", 0, 0.7)} />
                        </mesh>
                        {/* Líquido burbujeante interno */}
                        <mesh position={[0, -0.04, 0]}>
                            <sphereGeometry args={[0.06, 8, 8]} />
                            <meshStandardMaterial {...getMatProps("#fbbf24", 0, 0.5, true, 0.9, "#fbbf24", 0.5)} />
                        </mesh>
                    </group>
                )

            // --- JEFE FINAL: REACTOR TÓXICO INDUSTRIAL (MEGA CONTENEDOR) ---
            case 'final_boss':
                return (
                    <group scale={3.0}>
                        {/* Cuerpo del reactor principal */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 0.35, 16]} />
                            <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.1} />
                        </mesh>
                        {/* Líquido burbujeante violeta interno */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.13, 0.13, 0.22, 12]} />
                            <meshStandardMaterial color="#c084fc" transparent opacity={0.7} emissive="#a855f7" emissiveIntensity={0.8} roughness={0.05} />
                        </mesh>
                        {/* Rejillas protectoras metálicas externas */}
                        <mesh position={[0, 0.12, 0]}>
                            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
                            <meshStandardMaterial color="#991b1b" metalness={0.9} roughness={0.1} />
                        </mesh>
                        <mesh position={[0, -0.12, 0]}>
                            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
                            <meshStandardMaterial color="#991b1b" metalness={0.9} roughness={0.1} />
                        </mesh>
                        {/* Varillas de contención de energía amarillas */}
                        {Array.from({ length: 4 }).map((_, i) => {
                            const angle = (i * Math.PI) / 2
                            const x = Math.cos(angle) * 0.155
                            const z = Math.sin(angle) * 0.155
                            return (
                                <mesh key={i} position={[x, 0, z]}>
                                    <boxGeometry args={[0.02, 0.28, 0.02]} />
                                    <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.2} />
                                </mesh>
                            )
                        })}
                        {/* Anillo de fuerza orbital */}
                        <mesh rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.22, 0.008, 8, 24]} />
                            <meshStandardMaterial color="#d8b4fe" emissive="#a855f7" emissiveIntensity={1.2} />
                        </mesh>
                        {/* Esferas reactoras satélite */}
                        {Array.from({ length: 3 }).map((_, i) => {
                            const angle = (i * Math.PI * 2) / 3
                            const x = Math.cos(angle) * 0.22
                            const z = Math.sin(angle) * 0.22
                            return (
                                <mesh key={i} position={[x, 0, z]}>
                                    <sphereGeometry args={[0.02, 8, 8]} />
                                    <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={1.5} />
                                </mesh>
                            )
                        })}
                        {/* Símbolo de advertencia peligroso en el frente */}
                        <mesh position={[0, 0, 0.152]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.04, 0.04, 0.002]} />
                            <meshStandardMaterial color="#fbbf24" emissive="#eab308" emissiveIntensity={0.8} />
                        </mesh>
                        <mesh position={[0, 0, 0.154]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.024, 0.024, 0.002]} />
                            <meshStandardMaterial color="#000000" />
                        </mesh>
                    </group>
                )

            default:
                return (
                    <mesh>
                        <octahedronGeometry args={[0.12, 0]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
                    </mesh>
                )
        }
    }

    // Halo de brillo exterior para los residuos dorados
    const renderGoldenGlow = () => {
        if (!isGolden) return null
        return (
            <mesh>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.12} />
            </mesh>
        )
    }

    return (
        <group ref={groupRef} position={position}>
            {renderModel()}
            {renderGoldenGlow()}
        </group>
    )
}
