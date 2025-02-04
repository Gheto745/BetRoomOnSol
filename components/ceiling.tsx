import { useMemo } from "react"
import * as THREE from "three"

export default function Ceiling() {
  const ceilingTexture = useMemo(() => createCeilingTexture(), [])

  const ceilingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: ceilingTexture,
      color: 0xffd700, // Colore base giallo
      metalness: 0.3,
      roughness: 0.7,
      bumpMap: ceilingTexture,
      bumpScale: 0.02,
    })
  }, [ceilingTexture])

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
      <planeGeometry args={[20, 20]} />
      <primitive object={ceilingMaterial} attach="material" />
    </mesh>
  )
}

function createCeilingTexture() {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  // Sfondo giallo
  ctx.fillStyle = "#FFD700"
  ctx.fillRect(0, 0, size, size)

  // Crea un pattern di stelle
  const createStar = (x, y, spikes, outerRadius, innerRadius) => {
    ctx.save()
    ctx.beginPath()
    ctx.translate(x, y)
    ctx.moveTo(0, 0 - outerRadius)
    for (let i = 0; i < spikes; i++) {
      ctx.rotate(Math.PI / spikes)
      ctx.lineTo(0, 0 - innerRadius)
      ctx.rotate(Math.PI / spikes)
      ctx.lineTo(0, 0 - outerRadius)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Crea stelle bianche e nere
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)" // Bianco semi-trasparente
  for (let i = 0; i < 50; i++) {
    createStar(Math.random() * size, Math.random() * size, 5, Math.random() * 20 + 10, Math.random() * 10 + 5)
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.1)" // Nero semi-trasparente
  for (let i = 0; i < 50; i++) {
    createStar(Math.random() * size, Math.random() * size, 4, Math.random() * 15 + 8, Math.random() * 8 + 4)
  }

  // Aggiungi accenti blu e rossi
  const addAccents = (color) => {
    ctx.fillStyle = color
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const radius = Math.random() * 8 + 4
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  addAccents("rgba(0, 0, 255, 0.2)") // Blu
  addAccents("rgba(255, 0, 0, 0.2)") // Rosso

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5)
  return texture
}

