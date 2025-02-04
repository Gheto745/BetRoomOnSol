"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface LandingPageProps {
  onEnter: () => void
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cattura7().JPG-a9rUh8E7YcDaXAzPJQX6cFOacCBRFm.jpeg"
    img.crossOrigin = "anonymous"
    img.onload = () => setImageLoaded(true)
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Background image with cropping effect */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cattura7().JPG-a9rUh8E7YcDaXAzPJQX6cFOacCBRFm.jpeg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: imageLoaded ? 1 : 0,
        }}
      />

      {/* Dark overlay with gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Content - Moved to bottom left */}
      <div className="relative z-10 h-full flex flex-col items-start justify-end p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center perspective"
        >
          <motion.div
            className="relative inline-block"
            whileHover={{
              scale: 1.05,
              rotateX: 10,
              transition: { duration: 0.2 },
            }}
          >
            <motion.h1
              onClick={onEnter}
              className="text-7xl md:text-9xl font-bold cursor-pointer 
                         text-yellow-400 hover:text-yellow-300
                         transition-all duration-300
                         font-display tracking-wider transform-gpu"
              style={{
                textShadow: `
                  0 0 7px rgba(255,255,0,0.7),
                  0 0 10px rgba(255,255,0,0.7),
                  0 0 21px rgba(255,255,0,0.7),
                  0 0 42px rgba(255,255,0,0.7),
                  0 0 82px rgba(255,255,0,0.5),
                  0 0 92px rgba(255,255,0,0.5),
                  0 0 102px rgba(255,255,0,0.5),
                  0 0 151px rgba(255,255,0,0.5)
                `,
              }}
            >
              PLAY
            </motion.h1>

            <motion.div
              className="absolute inset-0 opacity-0 hover:opacity-100 
                         transition-opacity duration-300 pointer-events-none"
              initial={false}
              animate={{ scale: [1, 1.02, 1], rotate: [0, 1, -1, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-300/20 blur-xl" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

