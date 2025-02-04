import { useState, useEffect, useMemo } from "react"
import { Text } from "@react-three/drei"
import { CanvasTexture } from "three"
import { useCoins } from "../hooks/use-coins"

export default function PlinkoMiniGame({ onClose, isSlotEnlarged }) {
  const { coins, addCoins, removeCoins, hasEnoughCoins } = useCoins()
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 1.3 })
  const [gameState, setGameState] = useState("ready") // "ready", "playing", "finished"
  const [score, setScore] = useState(0)

  const frameTexture = useMemo(() => createFrameTexture(), [])
  const infoTexture = useMemo(() => createInfoTexture(), [])

  const startGame = () => {
    if ((gameState === "ready" || gameState === "finished") && hasEnoughCoins(5)) {
      removeCoins(5)
      setGameState("playing")
      setBallPosition({ x: 0, y: 1.3 })
      setScore(0)
    }
  }

  const resetGame = () => {
    setGameState("ready")
    setBallPosition({ x: 0, y: 1.3 })
    setScore(0)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        onClose()
      } else if (event.key === " ") {
        if (gameState === "ready" || gameState === "finished") {
          startGame()
        }
      } else if (event.key === "r") {
        resetGame()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, gameState, resetGame]) // Added resetGame to dependencies

  useEffect(() => {
    if (gameState === "playing") {
      const interval = setInterval(() => {
        setBallPosition((prev) => {
          const newX = prev.x + (Math.random() - 0.5) * 0.1
          const newY = prev.y - 0.03
          if (newY <= -1.1) {
            setGameState("finished")
            const finalScore = Math.floor((newX + 1.1) * 50)
            setScore(finalScore)
            addCoins(finalScore) // Add the score to coins
            return { x: -10, y: -10 } // Move the ball out of view
          }
          return { x: Math.max(-1.1, Math.min(1.1, newX)), y: newY }
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [gameState, addCoins])

  return (
    <group position={[0, 0.2, -1]} rotation={[0, 0, 0]} scale={0.8}>
      {/* Main frame */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[2.6, 3.4]} />
        <meshStandardMaterial map={frameTexture} />
      </mesh>

      {/* Game background */}
      <mesh position={[0, 0.1, -0.02]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshStandardMaterial color="#4B0082" emissive="#4B0082" emissiveIntensity={0.2} />
      </mesh>

      {/* Plinko pegs */}
      {[...Array(8)].map((_, row) =>
        [...Array(row + 1)].map((_, col) => (
          <mesh key={`${row}-${col}`} position={[(col - row / 2) * 0.22, 0.9 - row * 0.25, 0]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        )),
      )}

      {/* Ball */}
      {gameState === "playing" && (
        <mesh position={[ballPosition.x, ballPosition.y, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#FF4500" />
        </mesh>
      )}

      {/* Score frame */}
      <group position={[0, 1.5, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.4]} />
          <meshStandardMaterial map={infoTexture} />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.18} color="#FFD700">
          {`Score: ${score}`}
        </Text>
      </group>

      {/* Instructions frame */}
      <group position={[0, -1.5, 0]}>
        <mesh>
          <planeGeometry args={[2.2, 0.6]} />
          <meshStandardMaterial map={infoTexture} />
        </mesh>
        <Text position={[0, 0.1, 0.01]} fontSize={0.09} color="#FFD700" anchorY="top" maxWidth={2} textAlign="center">
          SPACE: Start (5 coins) | R: Reset | ENTER: Exit
          {gameState === "playing" ? "\nPlinko in progress..." : ""}
        </Text>
      </group>
    </group>
  )
}

function createFrameTexture() {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  // Sfondo dorato con gradiente radiale
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, "#FFD700")
  gradient.addColorStop(1, "#B8860B")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Bordo interno
  ctx.strokeStyle = "#DAA520"
  ctx.lineWidth = 40
  ctx.strokeRect(20, 20, size - 40, size - 40)

  // Motivo decorativo
  ctx.fillStyle = "#DAA520"
  for (let i = 0; i < size; i += 64) {
    for (let j = 0; j < size; j += 64) {
      ctx.beginPath()
      ctx.arc(i, j, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Angoli decorativi
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

  // Aggiunta di simboli Plinko
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  return new CanvasTexture(canvas)
}

function createInfoTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext("2d")

  // Sfondo con gradiente
  const gradient = ctx.createLinearGradient(0, 0, 512, 0)
  gradient.addColorStop(0, "#4B0082")
  gradient.addColorStop(0.5, "#8A2BE2")
  gradient.addColorStop(1, "#4B0082")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 128)

  // Bordo decorativo
  ctx.strokeStyle = "#FFD700"
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, 504, 120)

  // Motivo decorativo
  ctx.fillStyle = "#FFD700"
  for (let i = 0; i < 512; i += 32) {
    ctx.beginPath()
    ctx.arc(i, 0, 2, 0, Math.PI * 2)
    ctx.arc(i, 128, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Aggiunta di piccoli simboli Plinko
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 128
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  return new CanvasTexture(canvas)
}

