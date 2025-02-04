export default function CeilingPanel({
  position,
  size,
}: { position: [number, number, number]; size: [number, number] }) {
  return (
    <group position={position}>
      {/* Pannello principale */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size[0], 0.1, size[1]]} />
        <meshStandardMaterial color="#4B0082" />
      </mesh>

      {/* Bordo decorativo */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[size[0] + 0.1, 0.05, size[1] + 0.1]} />
        <meshStandardMaterial color="#800080" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

