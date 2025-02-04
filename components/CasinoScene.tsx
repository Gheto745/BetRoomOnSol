/*
 * WARNING: This website and its content, including but not limited to code, design, and text, are the exclusive property of BetRoom and are protected by copyright and other intellectual property laws. All rights reserved.

The code provided on this website is part of the BetRoom virtual casino project. For more information about the project, please visit our social media channels:

GitHub: https://github.com/Gheto745/BetRoomOnSol
Reddit: https://www.reddit.com/r/GamblingRoom/
Telegram:  https://t.me/BetRoomOnSol
X (Twitter): https://x.com/BetRoomOnSol

Unauthorized use or reproduction of this website or its content is strictly prohibited and will be prosecuted to the fullest extent of the law. This includes, but is not limited to, copying, modifying, distributing, or displaying any part of this website or its content without prior written consent from BetRoom.

For inquiries regarding the use of this website or its content, please contact us at @user_roo on Telegram.

We take the protection of our intellectual property seriously and will actively pursue any infringement. We have implemented measures to detect and track unauthorized use of our website and its content, and we will not hesitate to take legal action against any infringers.

Do not copy or reproduce any part of this website or its content without our permission. We will find you.

Thank you for your cooperation.
 */


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

