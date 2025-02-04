"use client"

import { Suspense, useState, useCallback, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { PointerLockControls, PerspectiveCamera, OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import CasinoScene from "./casino-scene"
import VirtualCoinInfo from "./virtual-coin-info"
import NavigationControls from "./navigation-controls"
import HomeButton from "./home-button"
import MobileControls from "./mobile-controls"
import MiniPointer from "./mini-pointer"

interface CasinoVirtualeProps {
  onReturnHome: () => void
}

export default function CasinoVirtuale({ onReturnHome }: CasinoVirtualeProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [isSlotEnlarged, setIsSlotEnlarged] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [useFallbackControls, setUseFallbackControls] = useState(false)
  const [hasError, setHasError] = useState(false)
  const lockRef = useRef(false)
  const canvasRef = useRef(null)
  const pointerLockControlsRef = useRef(null)
  const onlinePlayersRef = useRef(Math.floor(Math.random() * (90 - 12 + 1) + 12))

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLock = useCallback(() => {
    setIsLocked(true)
    lockRef.current = true
  }, [])

  const handleUnlock = useCallback(() => {
    setIsLocked(false)
    lockRef.current = false
  }, [])

  const handleSlotEnlarge = useCallback(() => {
    if (lockRef.current || isMobile) {
      setIsSlotEnlarged(true)
      if (pointerLockControlsRef.current) {
        pointerLockControlsRef.current.unlock()
      }
    }
  }, [isMobile])

  const handleSlotClose = useCallback(() => {
    setIsSlotEnlarged(false)
    setTimeout(() => {
      if (!isMobile && pointerLockControlsRef.current) {
        pointerLockControlsRef.current.lock()
      }
    }, 100)
  }, [isMobile])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && isSlotEnlarged) {
        event.preventDefault()
        handleSlotClose()
      } else if (event.key === "Escape" && !isSlotEnlarged) {
        setIsLocked(false)
        lockRef.current = false
        if (pointerLockControlsRef.current) {
          pointerLockControlsRef.current.unlock()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSlotEnlarged, handleSlotClose])

  const handleContextLost = useCallback((event) => {
    event.preventDefault()
    console.warn("WebGL context lost. Attempting to restore...")
  }, [])

  const handleContextRestored = useCallback(() => {
    console.log("WebGL context restored.")
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener("webglcontextlost", handleContextLost, false)
      canvas.addEventListener("webglcontextrestored", handleContextRestored, false)
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener("webglcontextlost", handleContextLost)
        canvas.removeEventListener("webglcontextrestored", handleContextRestored)
      }
    }
  }, [handleContextLost, handleContextRestored])

  useEffect(() => {
    const isPointerLockSupported =
      "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document
    if (!isPointerLockSupported) {
      console.warn("Pointer Lock API not supported. Using fallback controls.")
      setUseFallbackControls(true)
    }
  }, [])

  const handleError = (error) => {
    console.error("An error occurred in the 3D scene:", error)
    setHasError(true)
  }

  if (hasError) {
    return <div>An error occurred. Please refresh the page or try again later.</div>
  }

  return (
    <div className="w-screen h-screen bg-black">
      <Canvas
        ref={canvasRef}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000")
        }}
        onError={handleError}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 1.7, 0]} fov={75} />
          <CasinoScene
            onSlotEnlarge={handleSlotEnlarge}
            onSlotClose={handleSlotClose}
            isSlotEnlarged={isSlotEnlarged}
          />
          {!isSlotEnlarged && !isMobile && (
            <>
              <PointerLockControls
                ref={pointerLockControlsRef}
                onLock={handleLock}
                onUnlock={handleUnlock}
                onError={(error) => {
                  console.error("PointerLockControls error:", error)
                  setIsLocked(false)
                  lockRef.current = false
                  setUseFallbackControls(true)
                }}
              />
              {useFallbackControls && <OrbitControls enableZoom={false} enablePan={false} />}
            </>
          )}
          {isMobile && <OrbitControls enableZoom={false} enablePan={false} />}
          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      {!isLocked && !isSlotEnlarged && !isMobile && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl cursor-pointer bg-purple-900/50 p-4 rounded-lg pointer-events-auto hover:bg-purple-800/50 transition-colors duration-300">
          {lockRef.current ? "Try to control the view again" : "Click to control the view"}
        </div>
      )}
      {isLocked && !isSlotEnlarged && !isMobile && <MiniPointer />}
      {!isSlotEnlarged && <VirtualCoinInfo isSlotEnlarged={isSlotEnlarged} onlinePlayers={onlinePlayersRef.current} />}
      {!isSlotEnlarged && !isMobile && <NavigationControls />}
      {!isSlotEnlarged && <HomeButton onReturn={onReturnHome} />}
      {isMobile && !isSlotEnlarged && <MobileControls />}
    </div>
  )
}

