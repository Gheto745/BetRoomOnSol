import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

interface HomeButtonProps {
  onReturn: () => void
}

export default function HomeButton({ onReturn }: HomeButtonProps) {
  return (
    <Button
      className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white text-sm md:text-base p-2 md:p-4"
      onClick={onReturn}
    >
      <Home className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
      Home
    </Button>
  )
}

