import { useState, useEffect, useMemo, useCallback } from "react"
import { Text } from "@react-three/drei"
import { CanvasTexture } from "three"
import { useCoins } from "../hooks/use-coins"

type Symbol = "🍒" | "🍋" | "🍇" | "🍊" | "🍉"

export default function SlotMiniGame({ onClose, isSlotEnlarged }) {
  const { coins, addCoins, removeCoins, hasEnoughCoins } = useCoins()
  const [symbols, setSymbols] = useState<Symbol[][]>([
    ["🍒", "🍋", "🍇"],
    ["🍊", "🍉", "🍒"],
    ["🍋", "🍇", "🍉"],
  ])
  const [spinning, setSpinning] = useState(false)
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready")
  const [result, setResult] = useState<"WIN" | "LOSE" | null>(null)

  const frameTexture = useMemo(() => createFrameTexture(), [])
  const infoTexture = useMemo(() => createInfoTexture(), [])

  const spin = useCallback(() => {
    if ((gameState === "ready" || gameState === "finished") && hasEnoughCoins(5)) {
      removeCoins(5)
      setGameState("playing")
      setSpinning(true)
      setResult(null)
      const spinDuration = 2000
      const interval = setInterval(() => {
        setSymbols(generateRandomSymbols())
      }, 100)

      setTimeout(() => {
        clearInterval(interval)
        setSpinning(false)
        setGameState("finished")
        const finalSymbols = generateRandomSymbols()
        setSymbols(finalSymbols)
        const spinResult = calculateResult(finalSymbols)
        setResult(spinResult)
        if (spinResult === "WIN") {
          addCoins(10) // Win 10 coins
        }
      }, spinDuration)
    }
  }, [gameState, hasEnoughCoins, removeCoins, addCoins])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        onClose()
      } else if (event.key === " ") {
        spin()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, spin])

  function generateRandomSymbols(): Symbol[][] {
    const allSymbols: Symbol[] = ["🍒", "🍋", "🍇", "🍊", "🍉"]
    return Array(3)
      .fill(null)
      .map(() =>
        Array(3)
          .fill(null)
          .map(() => allSymbols[Math.floor(Math.random() * allSymbols.length)]),
      )
  }

  function calculateResult(finalSymbols: Symbol[][]): "WIN" | "LOSE" {
    // Check rows
    for (const row of finalSymbols) {
      if (row[0] === row[1] && row[1] === row[2]) return "WIN"
    }
    // Check columns
    for (let col = 0; col < 3; col++) {
      if (finalSymbols[0][col] === finalSymbols[1][col] && finalSymbols[1][col] === finalSymbols[2][col]) return "WIN"
    }
    // Check diagonals
    if (
      (finalSymbols[0][0] === finalSymbols[1][1] && finalSymbols[1][1] === finalSymbols[2][2]) ||
      (finalSymbols[0][2] === finalSymbols[1][1] && finalSymbols[1][1] === finalSymbols[2][0])
    )
      return "WIN"
    return "LOSE"
  }

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

      {/* Slot machine symbols */}
      <group position={[0, 0.3, 0]}>
        {symbols.map((row, rowIndex) =>
          row.map((symbol, colIndex) => (
            <Text
              key={`${rowIndex}-${colIndex}`}
              position={[(colIndex - 1) * 0.6, (1 - rowIndex) * 0.6, 0]}
              fontSize={0.5}
              color="#ffffff"
            >
              {symbol}
            </Text>
          )),
        )}
      </group>

      {/* Result frame */}
      <group position={[0, 1.4, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.4]} />
          <meshStandardMaterial map={infoTexture} />
        </mesh>
        {result && (
          <Text position={[0, 0, 0.01]} fontSize={0.25} color={result === "WIN" ? "#00ff00" : "#ff0000"}>
            {result}
          </Text>
        )}
      </group>

      {/* Instructions frame */}
      <group position={[0, -1.4, 0]}>
        <mesh>
          <planeGeometry args={[2.2, 0.6]} />
          <meshStandardMaterial map={infoTexture} />
        </mesh>
        <Text position={[0, 0.1, 0.01]} fontSize={0.09} color="#FFD700" anchorY="top" maxWidth={2} textAlign="center">
          SPACE: Spin (5 coins) | ENTER: Exit
          {gameState === "playing" ? "\nSpinning..." : ""}
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

  // Aggiunta di simboli di slot machine
  const symbols = ["🍒", "🍋", "🍇", "🍊", "🍉", "7️⃣"]
  ctx.font = "48px Arial"
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  for (let i = 0; i < 20; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillText(symbol, x, y)
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

  // Aggiunta di piccoli simboli di slot machine
  const symbols = ["🍒", "🍋", "🍇", "🍊", "🍉", "7️⃣"]
  ctx.font = "16px Arial"
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  for (let i = 0; i < 10; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const x = Math.random() * 512
    const y = Math.random() * 128
    ctx.fillText(symbol, x, y)
  }

  return new CanvasTexture(canvas)
}

