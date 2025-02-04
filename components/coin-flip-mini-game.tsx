import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Text, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { CanvasTexture, MeshStandardMaterial, DoubleSide } from "three"
import { useCoins } from "../hooks/use-coins"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import useSound from "use-sound"
import { gsap } from "gsap"

export default function CoinFlipMiniGame({ onClose, isSlotEnlarged }) {
  const { coins, addCoins, removeCoins, hasEnoughCoins } = useCoins()
  const [flipResult, setFlipResult] = useState<"TESTA" | "CROCE" | null>(null)
  const [gameState, setGameState] = useState<"ready" | "flipping" | "finished">("ready")
  const [userChoice, setUserChoice] = useState<"TESTA" | "CROCE" | null>(null)
  const [betAmount, setBetAmount] = useState<10 | 20>(10)
  const bloomRef = useRef()
  const coinRef = useRef()
  const [coinPosition, setCoinPosition] = useState({ x: 0, y: 0, z: 0.5 })

  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.5 })
  const [playLose] = useSound("/sounds/lose.mp3", { volume: 0.5 })

  const frameTexture = useMemo(() => createFrameTexture(), [])
  const infoTexture = useMemo(() => createInfoTexture(), [])

  // Carica la texture personalizzata
  const coinTexture = useTexture(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-01-30_22-29-41.jpg-OfE4ktGtx3llFMOoQN4Q69sQqCXkD6.jpeg",
  )

  const coinMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#FFB700",
        metalness: 0.9,
        roughness: 0.1,
        side: DoubleSide,
      }),
    [],
  )

  const coinFaceMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        map: coinTexture,
        metalness: 0.8,
        roughness: 0.2,
        color: "#FFB700",
      }),
    [coinTexture],
  )

  const flipCoin = useCallback(() => {
    if ((gameState === "ready" || gameState === "finished") && hasEnoughCoins(betAmount) && userChoice) {
      removeCoins(betAmount)
      setGameState("flipping")
      setFlipResult(null)

      const result: "TESTA" | "CROCE" = Math.random() < 0.5 ? "TESTA" : "CROCE"
      const flips = Math.floor(Math.random() * 3) + 5 // 5 to 7 flips
      const flipDuration = 0.15
      const totalDuration = flips * flipDuration

      // Reset coin position and rotation
      gsap.set(coinRef.current.position, { x: 0, y: 0.3, z: 0.5 })
      gsap.set(coinRef.current.rotation, { x: 0, y: 0, z: 0 })

      // Create the flip animation
      const timeline = gsap.timeline()

      // Add multiple flips
      for (let i = 0; i < flips; i++) {
        timeline.to(coinRef.current.rotation, {
          x: `+=${Math.PI}`,
          duration: flipDuration,
          ease: "power1.inOut",
        })
      }

      // Add a parabolic motion
      timeline.to(
        coinRef.current.position,
        {
          y: 1.3,
          duration: totalDuration / 2,
          ease: "power2.out",
        },
        0,
      )
      timeline.to(
        coinRef.current.position,
        {
          y: 0.3,
          duration: totalDuration / 2,
          ease: "power2.in",
        },
        totalDuration / 2,
      )

      // Final rotation and position
      timeline.to(coinRef.current.rotation, {
        x: result === "TESTA" ? 0 : Math.PI,
        y: Math.PI / 2,
        z: Math.PI / 2,
        duration: 0.5,
        ease: "bounce.out",
        onComplete: () => {
          setFlipResult(result)
          setGameState("finished")
          if (result === userChoice) {
            addCoins(betAmount * 2)
            playWin()
          } else {
            playLose()
          }
        },
      })
    }
  }, [gameState, hasEnoughCoins, removeCoins, addCoins, userChoice, betAmount, playWin, playLose])

  useFrame((state, delta) => {
    if (coinRef.current && gameState === "ready") {
      coinRef.current.rotation.x += delta * 2
      coinRef.current.rotation.y = 0
      coinRef.current.rotation.z = 0
    }
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        onClose()
      } else if (event.key === " ") {
        flipCoin()
      } else if (event.key === "t" || event.key === "T") {
        setUserChoice("TESTA")
      } else if (event.key === "c" || event.key === "C") {
        setUserChoice("CROCE")
      } else if (event.key === "1") {
        setBetAmount(10)
      } else if (event.key === "2") {
        setBetAmount(20)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, flipCoin])

  useEffect(() => {
    if (gameState === "ready" && coinRef.current) {
      gsap.to(coinRef.current.position, {
        y: 0.3,
        duration: 1,
        ease: "power2.out",
      })
      gsap.to(coinRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: "power2.out",
      })
    }
  }, [gameState])

  return (
    <group position={[0, 0.2, -1]} rotation={[0, 0, 0]} scale={0.8}>
      <ambientLight intensity={0.5} />
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[2.6, 3.4]} />
        <meshStandardMaterial map={frameTexture} />
      </mesh>

      <mesh position={[0, 0.1, -0.02]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshStandardMaterial color="#4B0082" emissive="#4B0082" emissiveIntensity={0.2} />
      </mesh>

      <group ref={coinRef} position={[coinPosition.x, coinPosition.y + 0.3, coinPosition.z]} scale={0.65}>
        <mesh material={coinMaterial}>
          <cylinderGeometry args={[0.5, 0.5, 0.08, 32, 1, false, 0, Math.PI * 2]} />
        </mesh>

        <mesh position={[0, 0.041, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.48, 32]} />
          <meshStandardMaterial map={coinTexture} metalness={0.8} roughness={0.2} color="#FFB700" />
        </mesh>

        <mesh position={[0, -0.041, 0]} rotation={[-Math.PI / 2, Math.PI, 0]}>
          <circleGeometry args={[0.48, 32]} />
          <meshStandardMaterial map={coinTexture} metalness={0.8} roughness={0.2} color="#FFB700" />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.49, 0.04, 32, 100]} />
          <meshStandardMaterial color="#FFB700" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <pointLight position={[0.7, 0.7, 1]} intensity={0.8} color="#FFD700" />
      <pointLight position={[-0.7, -0.7, 1]} intensity={0.8} color="#FFD700" />
      <spotLight
        position={[0, 2, 2]}
        angle={0.5}
        penumbra={0.5}
        intensity={1.5}
        color="#FFFFFF"
        castShadow
        target={coinRef.current}
      />

      <group position={[0, -0.5, 0]}>
        <Text position={[0, 0.2, 0.01]} fontSize={0.18} color="#FFD700" anchorX="center" anchorY="middle">
          La tua scelta: {userChoice || ""}
        </Text>
        <Text position={[0, -0.1, 0.01]} fontSize={0.18} color="#FFD700" anchorX="center" anchorY="middle">
          Puntata: {betAmount} monete
        </Text>
      </group>

      <group position={[0, 1.4, 0]}>
        <mesh>
          <planeGeometry args={[1.6, 0.6]} />
          <meshStandardMaterial map={infoTexture} />
        </mesh>
        {gameState === "finished" && flipResult && (
          <>
            <Text position={[0, 0.1, 0.01]} fontSize={0.3} color={flipResult === userChoice ? "#00ff00" : "#ff0000"}>
              {flipResult === userChoice ? "VINTO!" : "PERSO!"}
            </Text>
            <Text position={[0, -0.2, 0.01]} fontSize={0.2} color="#FFD700">
              Risultato: {flipResult}
            </Text>
          </>
        )}
      </group>

      <group position={[0, -1.3, 0]}>
        <mesh>
          <planeGeometry args={[2.2, 0.8]} />
          <meshStandardMaterial map={infoTexture} />
        </mesh>
        <Text position={[0, 0.2, 0.01]} fontSize={0.11} color="#FFD700" anchorX="center" anchorY="middle">
          T: Scegli Testa | C: Scegli Croce
        </Text>
        <Text position={[0, 0, 0.01]} fontSize={0.11} color="#FFD700" anchorX="center" anchorY="middle">
          1: Punta 10 | 2: Punta 20
        </Text>
        <Text position={[0, -0.2, 0.01]} fontSize={0.11} color="#FFD700" anchorX="center" anchorY="middle">
          SPAZIO: Lancia | INVIO: Esci
        </Text>
      </group>
      <EffectComposer>
        <Bloom ref={bloomRef} intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
      </EffectComposer>
    </group>
  )
}

function createFrameTexture() {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, "#FFD700")
  gradient.addColorStop(1, "#B8860B")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = "#DAA520"
  ctx.lineWidth = 40
  ctx.strokeRect(20, 20, size - 40, size - 40)

  ctx.fillStyle = "#DAA520"
  for (let i = 0; i < size; i += 64) {
    for (let j = 0; j < size; j += 64) {
      ctx.beginPath()
      ctx.arc(i, j, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const cornerSize = 200
  ;[
    [0, 0],
    [size, 0],
    [0, size],
    [size, size],
  ].forEach(([x, y]) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(x ? (y ? Math.PI : Math.PI / 2) : y ? -Math.PI / 2 : 0)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(cornerSize, 0)
    ctx.arcTo(0, 0, 0, cornerSize, cornerSize)
    ctx.closePath()
    ctx.fillStyle = "rgba(218, 165, 32, 0.7)"
    ctx.fill()
    ctx.restore()
  })

  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.beginPath()
    ctx.arc(x, y, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  return new CanvasTexture(canvas)
}

function createInfoTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext("2d")

  const gradient = ctx.createLinearGradient(0, 0, 512, 0)
  gradient.addColorStop(0, "#4B0082")
  gradient.addColorStop(0.5, "#8A2BE2")
  gradient.addColorStop(1, "#4B0082")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 128)

  ctx.strokeStyle = "#FFD700"
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, 504, 120)

  ctx.fillStyle = "#FFD700"
  for (let i = 0; i < 512; i += 32) {
    ctx.beginPath()
    ctx.arc(i, 0, 2, 0, Math.PI * 2)
    ctx.arc(i, 128, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 128
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"
    ctx.lineWidth = 1
    ctx.stroke()
  }

  return new CanvasTexture(canvas)
}

