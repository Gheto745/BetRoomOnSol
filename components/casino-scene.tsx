import { useRef, useState, useMemo, useEffect } from "react"
import * as THREE from "three"
import { Vector2, Vector3 } from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { Text, Instances, Instance, useFont } from "@react-three/drei"
import { gsap } from "gsap"
import SlotMachine from "./slot-machine"
import Roulette from "./roulette"
import SlotMiniGame from "./slot-mini-game"
import PlinkoMiniGame from "./plinko-mini-game"
import CoinFlipMiniGame from "./coin-flip-mini-game"
import Ceiling from "./ceiling"
import TVScreen from "./tv-screen"
import { useCoins } from "../hooks/use-coins"

export default function CasinoScene({ onSlotEnlarge, onSlotClose, isSlotEnlarged }) {
  const sceneRef = useRef()
  const { camera } = useThree()
  const [enlargedSlot, setEnlargedSlot] = useState(null)
  const { coins } = useCoins()
  const enlargedSlotRef = useRef()

  // Create procedural textures
  const wallTexture = useMemo(() => createDynamicWallTexture(), [])

  const handleSlotClick = (index) => {
    if (index === 0 || index === 1 || index === 2) {
      setEnlargedSlot(index)
      onSlotEnlarge()
    }
  }

  const closeEnlargedSlot = () => {
    setEnlargedSlot(null)
    onSlotClose()
  }

  // Create instances for repetitive elements
  const floorTiles = useMemo(() => {
    const tiles = []
    for (let x = -10; x <= 10; x += 2) {
      for (let z = -10; z <= 10; z += 2) {
        tiles.push([x, 0, z])
      }
    }
    return tiles
  }, [])

  const wallPanels = useMemo(() => {
    const panels = []
    // Front and back walls
    for (let x = -10; x <= 10; x += 2) {
      panels.push([x, 2, -10, 0, 0, 0]) // Back wall
      panels.push([x, 2, 10, 0, Math.PI, 0]) // Front wall
    }
    // Side walls
    for (let z = -10; z <= 10; z += 2) {
      panels.push([-10, 2, z, 0, Math.PI / 2, 0]) // Left wall
      panels.push([10, 2, z, 0, -Math.PI / 2, 0]) // Right wall
    }
    return panels
  }, [])

  useFrame(() => {
    if (enlargedSlot !== null && enlargedSlotRef.current) {
      const cameraDirection = new Vector3()
      camera.getWorldDirection(cameraDirection)
      const screenPosition = camera.position.clone().add(cameraDirection.multiplyScalar(1.5))
      enlargedSlotRef.current.position.copy(screenPosition)
      enlargedSlotRef.current.quaternion.copy(camera.quaternion)
    }
  })

  useEffect(() => {
    if (enlargedSlot !== null && enlargedSlotRef.current) {
      gsap.from(enlargedSlotRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      })
    }
  }, [enlargedSlot])

  // Create parquet textures
  const { map: parquetTexture, normalMap: parquetNormalMap } = useMemo(() => createParquetTexture(), [])

  return (
    <group ref={sceneRef}>
      {/* Optimized ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />

      {/* Updated Parquet Floor */}
      <Instances>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          map={parquetTexture}
          normalMap={parquetNormalMap}
          normalScale={new THREE.Vector2(0.1, 0.1)}
          metalness={0.4}
          roughness={0.6}
          envMapIntensity={1}
        />
        {floorTiles.map(([x, y, z], index) => (
          <Instance key={index} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} />
        ))}
      </Instances>

      {/* Walls with dynamic texture */}
      <Instances>
        <boxGeometry args={[2, 4, 0.1]} />
        <meshStandardMaterial map={wallTexture} metalness={0.3} roughness={0.7} normalScale={new Vector2(0.1, 0.1)} />
        {wallPanels.map(([x, y, z, rotX, rotY, rotZ], index) => (
          <Instance key={index} position={[x, y, z]} rotation={[rotX, rotY, rotZ]} />
        ))}
      </Instances>

      {/* Baseboards */}
      <Instances>
        <boxGeometry args={[2, 0.2, 0.05]} />
        <meshStandardMaterial color="#FFD700" metalness={0.4} roughness={0.6} />
        {wallPanels.map(([x, y, z, rotX, rotY, rotZ], index) => (
          <Instance key={`baseboard-${index}`} position={[x, 0.1, z]} rotation={[0, rotY, 0]} />
        ))}
      </Instances>

      {/* Crown molding */}
      <Instances>
        <boxGeometry args={[2, 0.2, 0.05]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.4} />
        {wallPanels.map(([x, y, z, rotX, rotY, rotZ], index) => (
          <Instance key={`crown-${index}`} position={[x, 3.9, z]} rotation={[0, rotY, 0]} />
        ))}
      </Instances>

      {/* Wall decorative elements */}
      <WallDecorations />

      {/* Add ceiling here */}
      <Ceiling />

      {/* Roulette */}
      <Roulette position={[0, 0, -4]} rotation={[0, 0, 0]} />

      {/* Slot machines */}
      <SlotMachine position={[-4, 0, 0]} rotation={[0, Math.PI / 4, 0]} onClick={handleSlotClick} index={0} />
      <SlotMachine position={[4, 0, 0]} rotation={[0, -Math.PI / 4, 0]} onClick={handleSlotClick} index={1} />
      <SlotMachine position={[0, 0, 4]} rotation={[0, Math.PI, 0]} onClick={handleSlotClick} index={2} />

      {/* TV Screen */}
      <TVScreen position={[4.3, 0, -3.7]} initialRotation={[0, -Math.PI / 3, 0]} />

      {/* Enlarged slot machine */}
      {enlargedSlot !== null && (
        <group ref={enlargedSlotRef}>
          {enlargedSlot === 0 && (
            <SlotMiniGame onClose={closeEnlargedSlot} coins={coins} isSlotEnlarged={isSlotEnlarged} />
          )}
          {enlargedSlot === 1 && (
            <PlinkoMiniGame onClose={closeEnlargedSlot} coins={coins} isSlotEnlarged={isSlotEnlarged} />
          )}
          {enlargedSlot === 2 && <CoinFlipMiniGame onClose={closeEnlargedSlot} isSlotEnlarged={isSlotEnlarged} />}
        </group>
      )}

      {/* Optimized decorations */}
      <Chandelier position={[0, 3.8, 0]} />
      <NeonSign position={[0, 3.3, -9.5]} />

      {/* Player position indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#00ff00" opacity={0.5} transparent />
      </mesh>
    </group>
  )
}

function Chandelier({ position }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
      <pointLight color="#FFD700" intensity={0.5} distance={10} />
    </group>
  )
}

function NeonSign({ position }) {
  const font = useFont("/fonts/Geist-Bold.ttf", "/fonts/Inter-Bold.ttf")

  const fontProps = {
    font: font.font,
    fontSize: 0.4,
    letterSpacing: 0.1,
    lineHeight: 1,
    "material-toneMapped": false,
  }

  return (
    <group position={position}>
      {/* Cornice esterna */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[4.2, 1.2, 0.1]} />
        <meshStandardMaterial color="#4B0082" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cornice interna */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[4, 1, 0.1]} />
        <meshStandardMaterial color="#800080" emissive="#800080" emissiveIntensity={0.5} />
      </mesh>

      {/* Testo principale */}
      <Text position={[0, 0.1, 0.1]} {...fontProps} color="#FF1493">
        Bet Room
      </Text>

      {/* Effetto glow */}
      <Text position={[0, 0.1, 0.09]} {...fontProps} color="#FF1493" material-transparent material-opacity={0.4}>
        Bet Room
      </Text>

      {/* Sottotitolo */}
      <Text position={[0, -0.3, 0.1]} fontSize={0.15} color="#FFD700" font={font.font}>
        Where Fortunes Are Made
      </Text>

      {/* Luci decorative */}
      <pointLight position={[-1.8, 0, 0.2]} color="#FF1493" intensity={0.5} distance={3} />
      <pointLight position={[1.8, 0, 0.2]} color="#FF1493" intensity={0.5} distance={3} />
      <pointLight position={[0, 0, 0.2]} color="#FFD700" intensity={0.3} distance={2} />
    </group>
  )
}

function WallDecorations() {
  const smallFrameTexture = useMemo(() => createFrameTexture(true), [])
  const largeFrameTexture = useMemo(() => createFrameTexture(false), [])

  return (
    <group>
      {/* Small frames with consistent styling */}
      {[
        { position: [-9.9, 2, -5], rotation: [0, Math.PI / 2, 0] },
        { position: [9.9, 2, 5], rotation: [0, -Math.PI / 2, 0] },
        { position: [5, 2, -9.9], rotation: [0, 0, 0] },
      ].map((props, index) => (
        <group key={index} position={props.position} rotation={props.rotation}>
          {/* Outer frame */}
          <mesh position={[0, 0, -0.05]} scale={[1.1, 1.1, 1]}>
            <planeGeometry args={[1.5, 2]} />
            <meshStandardMaterial color="#8B4513" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Middle frame */}
          <mesh position={[0, 0, -0.03]} scale={[1.05, 1.05, 1]}>
            <planeGeometry args={[1.5, 2]} />
            <meshStandardMaterial color="#A0522D" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Inner frame with image */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.5, 2]} />
            <meshStandardMaterial map={smallFrameTexture} />
          </mesh>
        </group>
      ))}

      {/* Large centerpiece frame */}
      <group position={[-4.5, 2, -9.85]}>
        {/* Outer frame */}
        <mesh position={[0, 0, -0.05]} scale={[1.8, 1.8, 1]}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#8B4513" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Middle frame */}
        <mesh position={[0, 0, -0.03]} scale={[1.7, 1.7, 1]}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#A0522D" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Inner frame with image */}
        <mesh position={[0, 0, 0]} scale={[1.6, 1.6, 1]}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial map={largeFrameTexture} />
        </mesh>

        {/* Frame lighting */}
        <pointLight position={[0, 2, 1]} color="#FFD700" intensity={0.3} distance={3} />
        <pointLight position={[0, -2, 1]} color="#FFD700" intensity={0.3} distance={3} />
      </group>

      {/* Rest of the decorations... */}
      <group position={[-8, 0, -8]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>
      <group position={[8, 0, 8]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>

      {/* Applique decorative */}
      <WallLamp position={[-9.9, 2.5, -2]} rotation={[0, Math.PI / 2, 0]} />
      <WallLamp position={[9.9, 2.5, 2]} rotation={[0, -Math.PI / 2, 0]} />
      <WallLamp position={[2, 2.5, -9.9]} rotation={[0, 0, 0]} />
      <WallLamp position={[-2, 2.5, 9.9]} rotation={[0, Math.PI, 0]} />

      {/* Specchi decorativi */}
      <Mirror position={[-9.9, 2, 2]} rotation={[0, Math.PI / 2, 0]} />
      <Mirror position={[9.9, 2, -2]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  )
}

function WallLamp({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.2, 0.4, 0.1]} />
        <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
      </mesh>
      <pointLight color="#FFD700" intensity={0.3} distance={5} position={[0, 0, 0.1]} />
    </group>
  )
}

function Mirror({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[1, 1.5]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1.1, 1.6, 0.05]} />
        <meshStandardMaterial color="#8B4513" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

function createDynamicFloorTexture() {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  // Sfondo giallo
  ctx.fillStyle = "#FFD700"
  ctx.fillRect(0, 0, size, size)

  // Motivo a scacchiera dinamico
  const squareSize = 64
  for (let i = 0; i < size; i += squareSize) {
    for (let j = 0; j < size; j += squareSize) {
      if ((i / squareSize + j / squareSize) % 2 === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)" // Bianco semi-trasparente
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)" // Nero semi-trasparente
      }
      ctx.beginPath()
      ctx.arc(i + squareSize / 2, j + squareSize / 2, squareSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Aggiunta di elementi decorativi blu e rossi
  const addDecorativeElements = (color, count) => {
    ctx.fillStyle = color
    for (let i = 0; i < count; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const radius = Math.random() * 15 + 5
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  addDecorativeElements("rgba(0, 0, 255, 0.3)", 30) // Blu
  addDecorativeElements("rgba(255, 0, 0, 0.3)", 30) // Rosso

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5)
  return texture
}

function createDynamicWallTexture() {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  // Sfondo giallo chiaro
  ctx.fillStyle = "#FFFFE0"
  ctx.fillRect(0, 0, size, size)

  // Crea un pattern di linee ondulate
  const createWavyPattern = (color, amplitude, frequency, lineWidth) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    for (let x = 0; x < size; x++) {
      const y = amplitude * Math.sin((x / size) * Math.PI * 2 * frequency) + size / 2
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }

  createWavyPattern("rgba(0, 0, 0, 0.1)", 50, 3, 10) // Nero
  createWavyPattern("rgba(255, 255, 255, 0.2)", 40, 5, 8) // Bianco

  // Aggiungi elementi decorativi
  const addDecorativeElements = (color, shape, count) => {
    ctx.fillStyle = color
    for (let i = 0; i < count; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const elementSize = Math.random() * 20 + 10
      ctx.beginPath()
      if (shape === "circle") {
        ctx.arc(x, y, elementSize / 2, 0, Math.PI * 2)
      } else if (shape === "square") {
        ctx.rect(x - elementSize / 2, y - elementSize / 2, elementSize, elementSize)
      }
      ctx.fill()
    }
  }

  addDecorativeElements("rgba(0, 0, 255, 0.2)", "circle", 20) // Blu
  addDecorativeElements("rgba(255, 0, 0, 0.2)", "square", 20) // Rosso

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 1)
  return texture
}

function createFrameTexture(isSmallFrame = false) {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  // Create and load the image
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.src = isSmallFrame
    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-02-04_13-43-25.jpg-LwUy0XZqDWn9pGD712dirsFVcUveoj.jpeg"
    : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-02-04_15-26-27(1)(1).jpg-AniyI5SZroWR4GPm8ebGMQ4i93PfiS.jpeg"

  const texture = new THREE.CanvasTexture(canvas)

  // When the image loads, draw it onto the canvas and update the texture
  img.onload = () => {
    // Clear the canvas
    ctx.clearRect(0, 0, size, size)

    // Draw outer frame with dark brown
    ctx.fillStyle = "#8B4513" // Dark brown
    ctx.fillRect(0, 0, size, size)

    // Draw middle frame with medium brown
    ctx.fillStyle = "#A0522D" // Medium brown
    ctx.fillRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9)

    // Draw inner frame with lighter brown
    ctx.fillStyle = "#CD853F" // Light brown
    ctx.fillRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8)

    // Calculate aspect ratio and drawing dimensions
    const aspectRatio = img.width / img.height
    const targetWidth = size * 0.85
    const targetHeight = size * 0.85

    // Center the image
    const offsetX = size * 0.075
    const offsetY = size * 0.075

    // Draw the image to fill the frame while maintaining aspect ratio
    ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight)

    // Add decorative corners
    const cornerSize = size * 0.15
    ctx.fillStyle = "#D2691E" // Chocolate brown for corners
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
      ctx.fill()
      ctx.restore()
    })

    texture.needsUpdate = true
  }

  return texture
}

function createParquetTexture() {
  const size = 2048 // Increased size for better detail
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  // Base color for wood
  ctx.fillStyle = "#8B4513"
  ctx.fillRect(0, 0, size, size)

  // Create wood grain pattern
  function createWoodGrain(color1, color2) {
    const grainSize = size / 16
    ctx.fillStyle = color1

    for (let i = 0; i < size; i += grainSize) {
      for (let j = 0; j < size; j += grainSize) {
        const noise = Math.random() * 0.15
        ctx.fillStyle = `rgba(${Number.parseInt(color2)}, ${Number.parseInt(color2 * 0.8)}, ${Number.parseInt(color2 * 0.6)}, ${noise})`
        ctx.fillRect(i, j, grainSize, grainSize)

        // Add wood grain lines
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.1})`
        ctx.beginPath()
        ctx.moveTo(i, j)
        ctx.lineTo(i + grainSize, j + grainSize)
        ctx.stroke()
      }
    }
  }

  // Create herringbone pattern
  function createHerringbonePattern() {
    const boardWidth = size / 8
    const boardLength = boardWidth * 4

    // Create individual wooden boards
    for (let i = -boardLength; i < size + boardLength; i += boardWidth) {
      for (let j = -boardLength; j < size + boardLength; j += boardLength) {
        // Right-pointing board
        ctx.save()
        ctx.translate(i, j)
        ctx.rotate(Math.PI / 4)
        createWoodGrain("#8B4513", 139) // Saddle brown
        ctx.restore()

        // Left-pointing board
        ctx.save()
        ctx.translate(i + boardWidth, j)
        ctx.rotate(-Math.PI / 4)
        createWoodGrain("#8B4513", 139)
        ctx.restore()
      }
    }

    // Add subtle border between boards
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
    ctx.lineWidth = 2
    for (let i = 0; i < size; i += boardWidth) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, size)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(size, i)
      ctx.stroke()
    }
  }

  createHerringbonePattern()

  // Add varnish effect
  ctx.fillStyle = "rgba(255, 248, 220, 0.1)"
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4) // Adjust the repeat pattern

  // Create normal map
  const normalCanvas = document.createElement("canvas")
  normalCanvas.width = size
  normalCanvas.height = size
  const normalCtx = normalCanvas.getContext("2d")

  // Generate normal map from the texture
  const imageData = ctx.getImageData(0, 0, size, size)
  const normalImageData = normalCtx.createImageData(size, size)

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = (i / 4) % size
    const y = Math.floor(i / 4 / size)

    if (x < size - 1 && y < size - 1) {
      const right = imageData.data[i + 4]
      const bottom = imageData.data[i + size * 4]

      normalImageData.data[i] = 127 + (right - imageData.data[i]) // R
      normalImageData.data[i + 1] = 127 + (bottom - imageData.data[i]) // G
      normalImageData.data[i + 2] = 255 // B
      normalImageData.data[i + 3] = 255 // A
    }
  }

  normalCtx.putImageData(normalImageData, 0, 0)

  const normalTexture = new THREE.CanvasTexture(normalCanvas)
  normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping
  normalTexture.repeat.set(4, 4)

  return {
    map: texture,
    normalMap: normalTexture,
  }
}

