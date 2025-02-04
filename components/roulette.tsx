import React, { useRef, useState, useCallback, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { useCoins } from "../hooks/use-coins"

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
  28, 12, 35, 3, 26,
]

const getColor = (number: number) => {
  if (number === 0) return "#00ff00"
  return number % 2 === 0 ? "#000000" : "#ff0000"
}

export default function Roulette({
  position,
  rotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const { coins, addCoins, removeCoins } = useCoins()
  const wheelRef = useRef<THREE.Group>(null)
  const ballRef = useRef<THREE.Mesh>(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [resultMessage, setResultMessage] = useState<string>("")
  const [messageColor, setMessageColor] = useState<string>("#ffffff")
  const spinSpeed = useRef(0)
  const ballAngle = useRef(0)
  const ballRadius = useRef(0.9)
  const [bets, setBets] = useState<{ [key: number]: number }>({})

  const spinWheel = useCallback(() => {
    if (!spinning && Object.keys(bets).length > 0) {
      setSpinning(true)
      spinSpeed.current = Math.random() * 0.3 + 0.2
      ballRadius.current = 0.9
      setResult(null)
      setResultMessage("")
      setMessageColor("#ffffff")
    }
  }, [spinning, bets])

  const placeBet = useCallback(
    (number: number) => {
      if (coins >= 3) {
        removeCoins(3)
        setBets((prevBets) => ({
          ...prevBets,
          [number]: (prevBets[number] || 0) + 1,
        }))
      }
    },
    [coins, removeCoins],
  )

  const handleResult = useCallback(
    (newResult: number) => {
      setResult(newResult)
      const winningBet = bets[newResult] || 0
      if (winningBet > 0) {
        const winAmount = winningBet * 36 // Payout is 36x the bet
        addCoins(winAmount)
        setResultMessage(`WIN! +${winAmount} coins`)
        setMessageColor("#00ff00")
      } else if (Object.keys(bets).length > 0) {
        setResultMessage("LOSE!")
        setMessageColor("#ff0000")
      }
      setBets({})
    },
    [addCoins, bets],
  )

  useFrame((state, delta) => {
    if (wheelRef.current && ballRef.current) {
      if (spinning) {
        wheelRef.current.rotation.y += spinSpeed.current
        ballAngle.current += spinSpeed.current * 1.5
        spinSpeed.current *= 0.99
        ballRadius.current *= 0.9999

        ballRef.current.position.x = Math.cos(ballAngle.current) * ballRadius.current
        ballRef.current.position.z = Math.sin(ballAngle.current) * ballRadius.current

        if (spinSpeed.current < 0.001) {
          setSpinning(false)
          const index = Math.floor(((wheelRef.current.rotation.y % (Math.PI * 2)) / (Math.PI * 2)) * 37)
          handleResult(numbers[index])
        }
      } else {
        wheelRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
      }
    }
  })

  const memoizedRouletteTable = useMemo(() => <RouletteTable bets={bets} onPlaceBet={placeBet} />, [bets, placeBet])

  return (
    <group position={position} rotation={rotation} scale={0.8}>
      {/* Supporto del tavolo */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[7.2, 3, 4.2]} />
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Gambe del tavolo */}
      {[
        [-3.4, -3, -1.9],
        [3.4, -3, -1.9],
        [-3.4, -3, 1.9],
        [3.4, -3, 1.9],
      ].map((legPosition, index) => (
        <mesh key={index} position={legPosition}>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
        </mesh>
      ))}

      {/* Piano del tavolo */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[7.2, 0.2, 4.2]} />
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Superficie del tavolo */}
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial color="#006400" roughness={1} metalness={0} />
      </mesh>

      {/* Ruota della roulette */}
      <group position={[-2.5, 0.3, 0]}>
        <mesh onClick={spinWheel}>
          <cylinderGeometry args={[1.2, 1.2, 0.1, 32, 1]} />
          <meshStandardMaterial color="#4B0082" metalness={0.5} roughness={0.5} />
        </mesh>
        <group ref={wheelRef} position={[0, 0.06, 0]}>
          {numbers.map((number, index) => (
            <group key={index} rotation={[0, (index / 37) * Math.PI * 2, 0]}>
              <mesh position={[1.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.15, 0.05, 0.05]} />
                <meshStandardMaterial color={getColor(number)} metalness={0.3} roughness={0.7} />
              </mesh>
              <Text
                position={[1.15, 0.03, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.04}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {number.toString()}
              </Text>
            </group>
          ))}
        </group>
        <mesh ref={ballRef} position={[1.1, 0.1, 0]}>
          <sphereGeometry args={[0.03, 32, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {result !== null && (
          <>
            <Text position={[0, 0.5, 0]} fontSize={0.15} color={messageColor}>
              {resultMessage}
            </Text>
            <Text position={[0, 0.3, 0]} fontSize={0.12} color="#FFD700">
              {`Number: ${result}`}
            </Text>
          </>
        )}

        {/* Centro della ruota */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 32]} />
          <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Tavolo della roulette */}
      <group position={[1.5, 0.2, -0.5]}>{memoizedRouletteTable}</group>

      {/* Illuminazione spot per il tavolo */}
      <spotLight
        position={[0, 5, 0]}
        angle={Math.PI / 3}
        penumbra={0.8}
        intensity={0.8} // Increased from 0.6 to 0.8
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.4} />
    </group>
  )
}

const RouletteTable = React.memo(
  ({
    bets,
    onPlaceBet,
  }: {
    bets: { [key: number]: number }
    onPlaceBet: (number: number) => void
  }) => {
    return (
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Base del tavolo */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[2.5, 1.5, 0.1]} />
          <meshStandardMaterial color="#006400" roughness={1} metalness={0} />
        </mesh>

        {/* Griglia dei numeri */}
        {[...Array(12)].map((_, row) =>
          [...Array(3)].map((_, col) => {
            const number = (12 - row) * 3 - col
            return (
              <group key={`${row}-${col}`} position={[(col - 1) * 0.35, (row - 5.5) * 0.35 + 0.175, 0.01]}>
                <mesh onClick={() => onPlaceBet(number)}>
                  <planeGeometry args={[0.33, 0.33]} />
                  <meshStandardMaterial
                    color={getColor(number)}
                    side={THREE.DoubleSide}
                    metalness={0.1}
                    roughness={0.9}
                  />
                </mesh>
                <Text position={[0, 0, 0.01]} rotation={[0, 0, 0]} fontSize={0.15} color="#ffffff">
                  {number.toString()}
                </Text>
                {bets[number] && (
                  <mesh position={[0, 0, 0.02]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.02, 32]} />
                    <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.5} />
                  </mesh>
                )}
              </group>
            )
          }),
        )}

        {/* Zero */}
        <group position={[0, -2.275, 0.01]}>
          <mesh onClick={() => onPlaceBet(0)}>
            <planeGeometry args={[1.05, 0.33]} />
            <meshStandardMaterial color="#006400" side={THREE.DoubleSide} metalness={0.1} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[1.03, 0.31]} />
            <meshStandardMaterial color="#00ff00" side={THREE.DoubleSide} metalness={0.1} roughness={0.9} />
          </mesh>
          <Text position={[0, 0, 0.002]} rotation={[0, 0, 0]} fontSize={0.15} color="#ffffff">
            0
          </Text>
          {bets[0] && (
            <mesh position={[0, 0, 0.02]}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 32]} />
              <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.5} />
            </mesh>
          )}
        </group>
      </group>
    )
  },
)

RouletteTable.displayName = "RouletteTable"

