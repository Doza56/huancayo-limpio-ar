import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface RadarProps {
    targets: { position: [number, number, number], type: string }[]
}

// Lista de tipos de residuos reciclables que el Detector Ambiental debe buscar
const RECYCLABLES = ['plastic_bottle', 'aluminum_can', 'paper', 'cardboard', 'container']

export function Radar({ targets }: RadarProps) {
    const arrowRef = useRef<THREE.Group>(null)
    const { camera } = useThree()

    useFrame(() => {
        if (!arrowRef.current) return

        // Buscar el residuo reciclable (no peligroso) más cercano
        let closestDist = Infinity
        let closestPos: THREE.Vector3 | null = null

        targets.forEach(t => {
            if (!RECYCLABLES.includes(t.type)) return // Ignorar residuos peligrosos

            const tPos = new THREE.Vector3(...t.position)
            const dist = camera.position.distanceTo(tPos)
            if (dist < closestDist) {
                closestDist = dist
                closestPos = tPos
            }
        })

        if (closestPos) {
            // Posicionar la aguja flotante frente a la cámara (a 0.5 metros de distancia)
            const forward = new THREE.Vector3(0, 0, -1)
            forward.applyQuaternion(camera.quaternion)
            forward.multiplyScalar(0.5) // 0.5 metros al frente
            const arrowPos = camera.position.clone().add(forward).add(new THREE.Vector3(0, -0.15, 0)) // Ligeramente abajo del centro de visión

            arrowRef.current.scale.set(1, 1, 1)
            arrowRef.current.position.copy(arrowPos)
            arrowRef.current.lookAt(closestPos)
        } else {
            // Ocultar la aguja si no quedan residuos reciclables
            arrowRef.current.scale.set(0, 0, 0)
        }
    })

    return (
        <group ref={arrowRef}>
            {/* Punta de la aguja: Verde Ambiental brillante */}
            <mesh rotation={[0, -Math.PI / 2, 0]}>
                <coneGeometry args={[0.03, 0.15, 6]} />
                <meshBasicMaterial color="#10b981" depthTest={false} transparent opacity={0.9} />
            </mesh>
            {/* Extremo de la aguja: Gris metálico */}
            <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.075, 0, 0]}>
                <coneGeometry args={[0.03, 0.07, 6]} />
                <meshBasicMaterial color="#94a3b8" depthTest={false} transparent opacity={0.7} />
            </mesh>
        </group>
    )
}
