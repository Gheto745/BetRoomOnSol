import { useRef } from "react"
import type * as THREE from "three"

interface WallPanelProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number]
}

export default function WallPanel({ position, rotation = [0, 0, 0], size }: WallPanelProps) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Pannello base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size[0], size[1], 0.1]} />
        <meshStandardMaterial color="#4B0082" />
      </mesh>

      {/* Cornice esterna */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[size[0] + 0.2, size[1] + 0.2, 0.02]} />
        <meshStandardMaterial color="#800080" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Modanatura interna */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[size[0] - 0.2, size[1] - 0.2, 0.02]} />
        <meshStandardMaterial color="#9400D3" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Illuminazione indiretta */}
      <pointLight position={[0, 0, 0.5]} color="#ff00ff" intensity={0.5} distance={2} decay={2} />
    </group>
  )
}

