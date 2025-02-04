import { Text3D } from "@react-three/drei"

export default function NeonSign({ position }) {
  return (
    <group position={position}>
      <Text3D font="/fonts/helvetiker_regular.typeface.json" size={0.8} height={0.2} curveSegments={12}>
        VIRTUAL CASINO
        <meshStandardMaterial color="#ff1493" emissive="#ff1493" emissiveIntensity={2} />
      </Text3D>
    </group>
  )
}

