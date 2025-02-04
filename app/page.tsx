"use client"

import { useState } from "react"
import LandingPage from "@/components/landing-page"
import CasinoVirtuale from "@/components/casino-virtuale"

export default function Home() {
  const [isEntered, setIsEntered] = useState(false)

  const handleEnter = () => setIsEntered(true)
  const handleReturnHome = () => setIsEntered(false)

  if (!isEntered) {
    return <LandingPage onEnter={handleEnter} />
  }

  return <CasinoVirtuale onReturnHome={handleReturnHome} />
}

