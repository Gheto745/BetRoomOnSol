import { useRef } from "react"
import { Text } from "@react-three/drei"
import type * as THREE from "three"

interface WallDecorationProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  text?: string
}

export default function WallDecoration({ position, rotation = [0, 0, 0], text }: WallDecorationProps) {
  const glowRef = useRef<THREE.Mesh>(null)

  return (
    <group position={position} rotation={rotation}>
      {/* Cornice decorativa */}
      <mesh>
        <torusGeometry args={[0.5, 0.05, 16, 32]} />
        <meshStandardMaterial
          color="#ff69b4"
          emissive="#ff1493"
          emissiveIntensity={2}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Effetto glow */}
      <mesh ref={glowRef} scale={[1.1, 1.1, 1]}>
        <torusGeometry args={[0.5, 0.08, 16, 32]} />
        <meshBasicMaterial color="#ff1493" transparent opacity={0.3} />
      </mesh>

      {/* Testo al neon (opzionale) */}
      {text && (
        <Text position={[0, 0, 0.1]} fontSize={0.2} color="#ff1493" anchorX="center" anchorY="middle">
          {text}
        </Text>
      )}

      {/* Luce punto */}
      <pointLight position={[0, 0, 0.2]} color="#ff1493" intensity={1} distance={3} decay={2} />
    </group>
  )
}

