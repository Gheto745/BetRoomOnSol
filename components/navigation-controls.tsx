export default function NavigationControls() {
  return (
    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
      <h3 className="text-lg font-bold mb-2">Controls</h3>
      <p>Move mouse to look around</p>
      <p>WASD to move (in progress)</p>
      <p>ESC to exit control mode</p>
      <p>The center pointer indicates the viewing direction</p>
    </div>
  )
}

