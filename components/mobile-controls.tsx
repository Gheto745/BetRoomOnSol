import { Button } from "@/components/ui/button"

export default function MobileControls() {
  return (
    <div className="fixed bottom-4 left-4 right-4 flex justify-between">
      <div>
        <Button className="mr-2 bg-purple-600 hover:bg-purple-700 text-white">Left</Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">Right</Button>
      </div>
      <div>
        <Button className="mr-2 bg-purple-600 hover:bg-purple-700 text-white">Forward</Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">Backward</Button>
      </div>
    </div>
  )
}

