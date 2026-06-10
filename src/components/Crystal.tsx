import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CrystalProps {
    position: [number, number, number]
    type: string // Representa el WasteType (plastic_bottle, aluminum_can, etc.)
}

export function Crystal({ position, type }: CrystalProps) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Rotación suave e inclinada en múltiples ejes para dinamismo natural
            groupRef.current.rotation.y += delta * 0.7
            groupRef.current.rotation.z += delta * 0.15
            groupRef.current.rotation.x = 0.1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1

            // Animación de flotado vertical (Bobbing) suave
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.3 + position[0]) * 0.07
        }
    })

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
                            <meshStandardMaterial color="#a5f3fc" transparent opacity={0.6} roughness={0.1} metalness={0.1} />
                        </mesh>
                        {/* Hombro de la botella */}
                        <mesh position={[0, 0.08, 0]}>
                            <cylinderGeometry args={[0.03, 0.06, 0.04, 12]} />
                            <meshStandardMaterial color="#a5f3fc" transparent opacity={0.6} roughness={0.1} />
                        </mesh>
                        {/* Cuello de la botella */}
                        <mesh position={[0, 0.115, 0]}>
                            <cylinderGeometry args={[0.03, 0.03, 0.03, 10]} />
                            <meshStandardMaterial color="#a5f3fc" transparent opacity={0.6} roughness={0.1} />
                        </mesh>
                        {/* Tapa azul */}
                        <mesh position={[0, 0.135, 0]}>
                            <cylinderGeometry args={[0.035, 0.035, 0.015, 10]} />
                            <meshStandardMaterial color="#0284c7" roughness={0.4} />
                        </mesh>
                    </group>
                )
            case 'aluminum_can':
                return (
                    <group>
                        {/* Cuerpo metálico plateado */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.065, 0.065, 0.16, 12]} />
                            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
                        </mesh>
                        {/* Borde metálico superior */}
                        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.06, 0.007, 8, 16]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                        </mesh>
                        {/* Borde metálico inferior */}
                        <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.06, 0.007, 8, 16]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                        </mesh>
                        {/* Anilla abre fácil en el tope */}
                        <mesh position={[0.015, 0.082, 0]} rotation={[0, 0, 0]}>
                            <boxGeometry args={[0.02, 0.002, 0.035]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
                        </mesh>
                    </group>
                )
            case 'paper':
                return (
                    <group>
                        {/* Dos hojas de papel dobladas e inclinadas */}
                        <mesh position={[0, 0, 0]} rotation={[0.3, 0.2, 0.5]}>
                            <boxGeometry args={[0.13, 0.002, 0.18]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.9} />
                        </mesh>
                        {/* Esquina doblada para simular papel usado */}
                        <mesh position={[0.045, 0.002, 0.07]} rotation={[0.3, 0.2, -0.6]}>
                            <boxGeometry args={[0.04, 0.0025, 0.04]} />
                            <meshStandardMaterial color="#e2e8f0" roughness={0.95} />
                        </mesh>
                        <mesh position={[-0.01, -0.005, 0.01]} rotation={[-0.2, 0.4, 0.1]}>
                            <boxGeometry args={[0.12, 0.0018, 0.17]} />
                            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
                        </mesh>
                    </group>
                )
            case 'cardboard':
                return (
                    <group>
                        {/* Caja de cartón marrón principal */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.18, 0.15, 0.18]} />
                            <meshStandardMaterial color="#d97706" roughness={0.9} />
                        </mesh>
                        {/* Solapas superiores parcialmente abiertas (lado A) */}
                        <mesh position={[-0.08, 0.085, 0]} rotation={[0, 0, 0.2]}>
                            <boxGeometry args={[0.05, 0.002, 0.18]} />
                            <meshStandardMaterial color="#b45309" roughness={0.9} />
                        </mesh>
                        {/* Solapas superiores parcialmente abiertas (lado B) */}
                        <mesh position={[0.08, 0.085, 0]} rotation={[0, 0, -0.2]}>
                            <boxGeometry args={[0.05, 0.002, 0.18]} />
                            <meshStandardMaterial color="#b45309" roughness={0.9} />
                        </mesh>
                        {/* Cinta de embalaje adhesiva */}
                        <mesh position={[0, 0.001, 0.091]}>
                            <boxGeometry args={[0.03, 0.14, 0.002]} />
                            <meshStandardMaterial color="#78350f" roughness={0.5} />
                        </mesh>
                    </group>
                )
            case 'container':
                return (
                    <group>
                        {/* Envase de cartón de jugo/leche (Tetra Pak) */}
                        <mesh position={[0, -0.03, 0]}>
                            <boxGeometry args={[0.11, 0.16, 0.11]} />
                            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
                        </mesh>
                        {/* Franjas decorativas reciclables */}
                        <mesh position={[0, -0.03, 0.056]}>
                            <boxGeometry args={[0.08, 0.04, 0.002]} />
                            <meshStandardMaterial color="#22c55e" roughness={0.5} />
                        </mesh>
                        {/* Tapa cónica inclinada superior */}
                        <mesh position={[0, 0.07, 0]} rotation={[0, Math.PI / 4, 0]}>
                            <coneGeometry args={[0.085, 0.04, 4]} />
                            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
                        </mesh>
                        {/* Pico/Rosca vertedora */}
                        <mesh position={[0.02, 0.085, 0.02]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                            <meshStandardMaterial color="#10b981" roughness={0.5} />
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
                            <meshStandardMaterial color="#18181b" metalness={0.5} roughness={0.3} />
                        </mesh>
                        {/* Anillo de advertencia amarillo cobre */}
                        <mesh position={[0, 0.02, 0]}>
                            <cylinderGeometry args={[0.046, 0.046, 0.06, 12]} />
                            <meshStandardMaterial color="#fbbf24" metalness={0.4} roughness={0.3} />
                        </mesh>
                        {/* Terminal superior cobre */}
                        <mesh position={[0, 0.08, 0]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.015, 8]} />
                            <meshStandardMaterial color="#ea580c" metalness={0.9} roughness={0.1} />
                        </mesh>
                        {/* Base metálica inferior */}
                        <mesh position={[0, -0.08, 0]}>
                            <cylinderGeometry args={[0.045, 0.045, 0.01, 12]} />
                            <meshStandardMaterial color="#64748b" metalness={0.8} />
                        </mesh>
                    </group>
                )
            case 'battery':
                return (
                    <group>
                        {/* Batería rectangular negra */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.15, 0.12, 0.09]} />
                            <meshStandardMaterial color="#09090b" roughness={0.4} />
                        </mesh>
                        {/* Franja de peligro amarilla */}
                        <mesh position={[0, 0, 0.046]}>
                            <boxGeometry args={[0.12, 0.02, 0.002]} />
                            <meshStandardMaterial color="#eab308" roughness={0.5} />
                        </mesh>
                        {/* Bornes visibles */}
                        <mesh position={[-0.04, 0.07, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
                            <meshStandardMaterial color="#ef4444" metalness={0.8} /> {/* Positivo Rojo */}
                        </mesh>
                        <mesh position={[0.04, 0.07, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
                            <meshStandardMaterial color="#cbd5e1" metalness={0.8} /> {/* Negativo Gris */}
                        </mesh>
                    </group>
                )
            case 'toxic_waste':
                return (
                    <group>
                        {/* Bidón rojo de residuos peligrosos */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.09, 0.09, 0.22, 12]} />
                            <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
                        </mesh>
                        {/* Anillos del bidón en negro */}
                        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.091, 0.008, 8, 16]} />
                            <meshStandardMaterial color="#111111" roughness={0.6} />
                        </mesh>
                        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.091, 0.008, 8, 16]} />
                            <meshStandardMaterial color="#111111" roughness={0.6} />
                        </mesh>
                        {/* Símbolo de advertencia ambiental (rombo amarillo) */}
                        <mesh position={[0, 0, 0.091]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.045, 0.045, 0.002]} />
                            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
                        </mesh>
                        {/* Detalle interno negro en el rombo */}
                        <mesh position={[0, 0, 0.093]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.025, 0.025, 0.002]} />
                            <meshStandardMaterial color="#000000" />
                        </mesh>
                    </group>
                )
            case 'chemical':
                return (
                    <group>
                        {/* Frasco químico naranja de laboratorio */}
                        <mesh position={[0, -0.03, 0]}>
                            <coneGeometry args={[0.095, 0.12, 10]} />
                            <meshStandardMaterial color="#ea580c" emissive="#7c2d12" emissiveIntensity={0.3} transparent opacity={0.8} roughness={0.1} />
                        </mesh>
                        {/* Cuello del matraz */}
                        <mesh position={[0, 0.05, 0]}>
                            <cylinderGeometry args={[0.024, 0.024, 0.05, 10]} />
                            <meshStandardMaterial color="#ea580c" transparent opacity={0.8} roughness={0.1} />
                        </mesh>
                        {/* Tapón negro */}
                        <mesh position={[0, 0.078, 0]}>
                            <cylinderGeometry args={[0.028, 0.028, 0.015, 8]} />
                            <meshStandardMaterial color="#18181b" roughness={0.7} />
                        </mesh>
                        {/* Líquido burbujeante interno */}
                        <mesh position={[0, -0.04, 0]}>
                            <sphereGeometry args={[0.06, 8, 8]} />
                            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} transparent opacity={0.9} />
                        </mesh>
                    </group>
                )
            default:
                // Fallback
                return (
                    <mesh>
                        <octahedronGeometry args={[0.12, 0]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
                    </mesh>
                )
        }
    }

    return (
        <group ref={groupRef} position={position}>
            {renderModel()}
        </group>
    )
}
