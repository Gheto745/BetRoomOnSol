export default function RouletteTable({ position }) {
  return (
    <group position={position}>
      {/* Base del tavolo */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2, 2.2, 1, 32]} />
        <meshStandardMaterial color="#8B0000" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Piano superiore della roulette */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 32]} />
        <meshStandardMaterial color="#006400" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Bordo luminoso */}
      <mesh position={[0, 1.1, 0]}>
        <torusGeometry args={[1.9, 0.05, 16, 100]} />
        <meshStandardMaterial color="#ff1493" emissive="#ff1493" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

