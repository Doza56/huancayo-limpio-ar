import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BulletProps {
    position: THREE.Vector3
    direction: THREE.Vector3
}

export function Bullet({ position, direction }: BulletProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const wireRef = useRef<THREE.Mesh>(null)
    const speed = 15 // m/s (metros por segundo)

    // Almacena la posición actual para moverla sin recalcular en base al prop inicial
    const currentPos = useRef(position.clone())

    useFrame((_, delta) => {
        // Mover la burbuja
        const move = direction.clone().multiplyScalar(speed * delta)
        currentPos.current.add(move)

        if (meshRef.current) {
            meshRef.current.position.copy(currentPos.current)
        }

        // Rotar el wireframe interno para darle dinamismo
        if (wireRef.current) {
            wireRef.current.rotation.x += delta * 2
            wireRef.current.rotation.y += delta * 1
        }
    })

    return (
        <group>
            {/* Burbuja Exterior Principal */}
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial
                    color="#10b981" // Verde esmeralda
                    emissive="#06b6d4" // Emisión cian para un brillo mixto
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.6}
                    roughness={0.1}
                    metalness={0.1}
                />
                
                {/* Estructura Interna del Capturador (Wireframe) */}
                <mesh ref={wireRef}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial
                        color="#a7f3d0"
                        wireframe
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            </mesh>
        </group>
    )
}
