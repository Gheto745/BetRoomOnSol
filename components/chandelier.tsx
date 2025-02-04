import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

export default function Chandelier({ position }: { position: [number, number, number] }) {
  const crystalsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (crystalsRef.current) {
      crystalsRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Base metallica */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Struttura principale */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.6, 0.4, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cristalli */}
      <group ref={crystalsRef}>
        {Array.from({ length: 16 }).map((_, i) => (
          <group key={i} rotation={[0, (i / 16) * Math.PI * 2, 0]}>
            <mesh position={[0.7, -0.2, 0]}>
              <coneGeometry args={[0.1, 0.3, 4]} />
              <meshStandardMaterial color="#FFF" transparent opacity={0.7} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Luce */}
      <pointLight color="#ffffff" intensity={1} distance={5} decay={2} />
    </group>
  )
}

