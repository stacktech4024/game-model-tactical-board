import { useEffect, useState } from 'react'
import { PixiCanvas } from './renderers/pixi/PixiCanvas'
import './App.css'

function App() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <main className="app-shell">
      <PixiCanvas width={viewport.width} height={viewport.height} />
    </main>
  )
}

export default App
