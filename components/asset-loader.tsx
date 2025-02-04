import { useProgress, Html } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { TextureLoader } from "three/src/loaders/TextureLoader"

export default function AssetLoader() {
  const { progress } = useProgress()

  // Precarica la texture del soffitto
  useLoader(TextureLoader, "/placeholder.svg?height=512&width=512")

  return (
    <Html center>
      <div className="text-white text-2xl">Caricamento... {progress.toFixed(0)}%</div>
    </Html>
  )
}

