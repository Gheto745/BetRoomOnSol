export default function SlotMachine({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Cabinet della slot machine */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.2, 2, 0.8]} />
        <meshStandardMaterial color="#4B0082" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Schermo */}
      <mesh position={[0, 1.2, 0.41]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} />
      </mesh>

      {/* Pulsanti luminosi */}
      <mesh position={[0, 0.6, 0.41]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

