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
            // Rotación elegante sobre el eje Y con ligera inclinación
            groupRef.current.rotation.y += delta * 0.8
            groupRef.current.rotation.x = 0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1

            // Animación de flotado (Bobbing)
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.08
        }
    })

    // Renderizado condicional del modelo 3D según el tipo de residuo
    const renderModel = () => {
        switch (type) {
            // --- RESIDUOS RECICLABLES ---
            case 'plastic_bottle':
                return (
                    <group>
                        {/* Cuerpo de la botella */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.07, 0.07, 0.22, 12]} />
                            <meshStandardMaterial color="#a5f3fc" transparent opacity={0.65} roughness={0.1} metalness={0.1} />
                        </mesh>
                        {/* Cuello de la botella */}
                        <mesh position={[0, 0.13, 0]}>
                            <cylinderGeometry args={[0.035, 0.035, 0.04, 10]} />
                            <meshStandardMaterial color="#a5f3fc" transparent opacity={0.65} roughness={0.1} />
                        </mesh>
                        {/* Tapa azul */}
                        <mesh position={[0, 0.155, 0]}>
                            <cylinderGeometry args={[0.04, 0.04, 0.02, 10]} />
                            <meshStandardMaterial color="#0284c7" roughness={0.5} />
                        </mesh>
                    </group>
                )
            case 'aluminum_can':
                return (
                    <group>
                        {/* Cuerpo de la lata */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.07, 0.07, 0.2, 12]} />
                            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
                        </mesh>
                        {/* Bordes metálicos */}
                        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.065, 0.006, 8, 16]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
                        </mesh>
                        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.065, 0.006, 8, 16]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
                        </mesh>
                    </group>
                )
            case 'paper':
                return (
                    <group>
                        {/* Hojas de papel arrugadas/superpuestas */}
                        <mesh position={[0, 0, 0]} rotation={[0.4, 0.2, 0.6]}>
                            <boxGeometry args={[0.16, 0.005, 0.22]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.9} />
                        </mesh>
                        <mesh position={[0.01, 0.01, 0.01]} rotation={[-0.3, 0.5, 0.2]}>
                            <boxGeometry args={[0.15, 0.005, 0.2]} />
                            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
                        </mesh>
                    </group>
                )
            case 'cardboard':
                return (
                    <group>
                        {/* Caja de cartón cerrada */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.18, 0.16, 0.18]} />
                            <meshStandardMaterial color="#b45309" roughness={0.85} />
                        </mesh>
                        {/* Cinta de embalaje */}
                        <mesh position={[0, 0.081, 0]}>
                            <boxGeometry args={[0.03, 0.002, 0.182]} />
                            <meshStandardMaterial color="#78350f" roughness={0.4} />
                        </mesh>
                    </group>
                )
            case 'container':
                return (
                    <group>
                        {/* Caja de cartón de leche/jugo (Tetra Pak) */}
                        <mesh position={[0, -0.02, 0]}>
                            <boxGeometry args={[0.11, 0.18, 0.11]} />
                            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
                        </mesh>
                        {/* Techo triangular */}
                        <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 4, 0]}>
                            <coneGeometry args={[0.085, 0.05, 4]} />
                            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
                        </mesh>
                        {/* Detalle tapa del envase */}
                        <mesh position={[0.03, 0.09, 0.02]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                            <meshStandardMaterial color="#ea580c" roughness={0.5} />
                        </mesh>
                    </group>
                )

            // --- RESIDUOS CONTAMINANTES / PELIGROSOS ---
            case 'used_battery':
                return (
                    <group>
                        {/* Cuerpo de la pila AA */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.045, 0.045, 0.15, 12]} />
                            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
                        </mesh>
                        {/* Banda de advertencia amarilla de la pila */}
                        <mesh position={[0, 0.02, 0]}>
                            <cylinderGeometry args={[0.046, 0.046, 0.05, 12]} />
                            <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.3} />
                        </mesh>
                        {/* Terminal positivo (pin metálico) */}
                        <mesh position={[0, 0.08, 0]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.015, 10]} />
                            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
                        </mesh>
                        {/* Brillo rojo de advertencia de peligro */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.048, 0.048, 0.152, 12]} />
                            <meshBasicMaterial color="#ef4444" transparent opacity={0.15} wireframe />
                        </mesh>
                    </group>
                )
            case 'battery':
                return (
                    <group>
                        {/* Batería rectangular (ej. batería de auto o 9V) */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.15, 0.13, 0.09]} />
                            <meshStandardMaterial color="#dc2626" roughness={0.5} />
                        </mesh>
                        {/* Bornes/Terminales */}
                        <mesh position={[-0.04, 0.075, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
                            <meshStandardMaterial color="#64748b" metalness={0.8} />
                        </mesh>
                        <mesh position={[0.04, 0.075, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
                            <meshStandardMaterial color="#334155" metalness={0.8} />
                        </mesh>
                        {/* Símbolo de advertencia o franja */}
                        <mesh position={[0, 0, 0.046]}>
                            <boxGeometry args={[0.08, 0.02, 0.002]} />
                            <meshStandardMaterial color="#facc15" roughness={0.5} />
                        </mesh>
                    </group>
                )
            case 'toxic_waste':
                return (
                    <group>
                        {/* Barril/Tambor de residuos químicos */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.09, 0.09, 0.22, 12]} />
                            <meshStandardMaterial color="#15803d" roughness={0.4} metalness={0.2} />
                        </mesh>
                        {/* Anillos del barril */}
                        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.092, 0.008, 8, 16]} />
                            <meshStandardMaterial color="#eab308" roughness={0.4} />
                        </mesh>
                        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.092, 0.008, 8, 16]} />
                            <meshStandardMaterial color="#eab308" roughness={0.4} />
                        </mesh>
                        {/* Símbolo de tóxico (emisor de luz verde) */}
                        <mesh position={[0, 0, 0.091]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.04, 0.04, 0.002]} />
                            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
                        </mesh>
                    </group>
                )
            case 'chemical':
                return (
                    <group>
                        {/* Frasco químico o matraz */}
                        <mesh position={[0, -0.04, 0]}>
                            <coneGeometry args={[0.1, 0.13, 10]} />
                            <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.4} transparent opacity={0.75} roughness={0.1} />
                        </mesh>
                        <mesh position={[0, 0.05, 0]}>
                            <cylinderGeometry args={[0.025, 0.025, 0.07, 10]} />
                            <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.4} transparent opacity={0.75} roughness={0.1} />
                        </mesh>
                        {/* Tapón */}
                        <mesh position={[0, 0.088, 0]}>
                            <cylinderGeometry args={[0.03, 0.03, 0.015, 8]} />
                            <meshStandardMaterial color="#334155" roughness={0.6} />
                        </mesh>
                    </group>
                )
            default:
                // Fallback por si acaso
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
