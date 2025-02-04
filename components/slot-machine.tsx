import { useRef, useState, useMemo, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { gsap } from "gsap"

const FRUIT_SYMBOLS = ["🍒", "🍋", "🍇", "🍊", "🍉"]

export default function SlotMachine({
  position,
  rotation,
  onClick,
  index,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  onClick: (index: number) => void
  index: number
}) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>()
  const [hovered, setHovered] = useState(false)

  const createSymbolTexture = useCallback((symbol: string) => {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#4B0082"
      ctx.fillRect(0, 0, 128, 128)
      ctx.fillStyle = "#FFD700"
      ctx.font = "80px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(symbol, 64, 64)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  const symbolTextures = useMemo(() => {
    return FRUIT_SYMBOLS.reduce(
      (acc, symbol) => {
        acc[symbol] = createSymbolTexture(symbol)
        return acc
      },
      {} as Record<string, THREE.Texture>,
    )
  }, [createSymbolTexture])

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation()
    onClick(index)

    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      })
    }
  }

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, hovered ? 1.05 : 1, 0.1)
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, hovered ? 1.05 : 1, 0.1)
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, hovered ? 1.05 : 1, 0.1)
      groupRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.2, 2, 0.8]} />
        <meshStandardMaterial color="#4B0082" metalness={0.6} roughness={0.2} />
      </mesh>

      <mesh position={[0, 1.2, 0.41]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color="#000000" emissive="#000000" emissiveIntensity={0.2} />
      </mesh>

      <group position={[0, 1.2, 0.42]}>
        {[
          [-0.2, 0.1],
          [0, 0.1],
          [0.2, 0.1],
        ].map((pos, i) => {
          const symbol = FRUIT_SYMBOLS[i % FRUIT_SYMBOLS.length]
          return (
            <mesh key={i} position={[pos[0], pos[1], 0]}>
              <planeGeometry args={[0.2, 0.2]} />
              <meshStandardMaterial map={symbolTextures[symbol]} transparent alphaTest={0.5} />
            </mesh>
          )
        })}
      </group>

      <mesh position={[0, 0.6, 0.41]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>

      <Text
        position={[0, 2.2, 0.41]}
        fontSize={index === 2 ? 0.15 : 0.2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        {index === 1 ? "PLINKO" : index === 2 ? "COIN FLIP" : "SLOT"}
      </Text>

      <pointLight position={[0, 1.2, 0.5]} intensity={0.5} color="#FFD700" />
    </group>
  )
}

