import { useRef } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import SlotMachine from "./SlotMachine"
import RouletteTable from "./RouletteTable"
import NeonSign from "./NeonSign"

export default function CasinoScene() {
  const sceneRef = useRef()

  // Crea il pattern ondulato per il pavimento
  const floorPattern = new THREE.TextureLoader().load(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-01-29_15-56-36.jpg-ee6tlNg1oNv7lAHVXRR73InuR8JG1i.jpeg",
  )
  floorPattern.wrapS = floorPattern.wrapT = THREE.RepeatWrapping
  floorPattern.repeat.set(4, 4)

  return (
    <group ref={sceneRef}>
      {/* Illuminazione ambiente */}
      <ambientLight intensity={0.2} />

      {/* Luci spot rosa/viola */}
      <spotLight position={[0, 5, 0]} angle={0.5} penumbra={0.5} intensity={2} color="#ff00ff" />
      <spotLight position={[-5, 5, 0]} angle={0.5} penumbra={0.5} intensity={1.5} color="#9400D3" />
      <spotLight position={[5, 5, 0]} angle={0.5} penumbra={0.5} intensity={1.5} color="#9400D3" />

      {/* Pavimento */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#ff1493"
          metalness={0.5}
          roughness={0.2}
          emissive="#ff69b4"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Pareti */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[20, 6, 0.1]} />
        <meshStandardMaterial color="#4B0082" />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 6, 0.1]} />
        <meshStandardMaterial color="#4B0082" />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[20, 6, 0.1]} />
        <meshStandardMaterial color="#4B0082" />
      </mesh>

      {/* Tavolo da roulette centrale */}
      <RouletteTable position={[0, 0, 0]} />

      {/* Slot machine disposte ai lati */}
      <SlotMachine position={[-4, 0, -3]} rotation={[0, Math.PI / 6, 0]} />
      <SlotMachine position={[-2, 0, -3]} rotation={[0, Math.PI / 12, 0]} />
      <SlotMachine position={[2, 0, -3]} rotation={[0, -Math.PI / 12, 0]} />
      <SlotMachine position={[4, 0, -3]} rotation={[0, -Math.PI / 6, 0]} />

      {/* Insegna al neon */}
      <NeonSign position={[0, 4, -9.5]} />
    </group>
  )
}

