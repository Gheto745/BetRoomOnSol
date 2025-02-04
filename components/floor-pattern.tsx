import { useRef } from "react"
import * as THREE from "three"

export default function FloorPattern({ position }: { position: [number, number, number] }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Shader per il pattern del pavimento
  const floorShader = {
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color("#ff1493") },
      color2: { value: new THREE.Color("#4B0082") },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;

      void main() {
        vec2 pos = vUv * 20.0;
        float pattern = sin(pos.x * 0.5 + time) * sin(pos.y * 0.5 + time) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, pattern);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <shaderMaterial ref={materialRef} args={[floorShader]} uniforms-time-value={0} />
    </mesh>
  )
}

