import { useCoins } from "../hooks/use-coins"

interface VirtualCoinInfoProps {
  isSlotEnlarged: boolean
  onlinePlayers: number
}

export default function VirtualCoinInfo({ isSlotEnlarged, onlinePlayers }: VirtualCoinInfoProps) {
  const { coins } = useCoins()

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-black bg-opacity-50 text-white p-2 md:p-4 rounded text-sm md:text-base">
        <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2">Virtual Coin</h2>
        <p>Online players: {onlinePlayers}</p>
      </div>
      <div className="mt-2 bg-pink-600 bg-opacity-80 text-white p-2 md:p-4 rounded text-sm md:text-base">
        <h3 className="text-lg font-bold mb-1">Balance</h3>
        <p className="text-2xl font-bold">{coins} VC</p>
      </div>
    </div>
  )
}

