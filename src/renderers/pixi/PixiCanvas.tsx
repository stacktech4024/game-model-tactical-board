import { Application, Graphics } from 'pixi.js'
import { useEffect, useRef } from 'react'
import { drawGrass } from './layers/GrassLayer'
import { drawMarkings } from './layers/MarkingsLayer'

type PixiCanvasProps = {
  width: number
  height: number
}

export function PixiCanvas({ width, height }: PixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const app = new Application()
    let cancelled = false
    let initialized = false
    let destroyed = false

    const destroyApp = () => {
      if (destroyed) {
        return
      }

      destroyed = true
      app.destroy(true)
    }

    const mount = async () => {
      await app.init({
        width,
        height,
        background: 0x1a1a1a,
        antialias: true,
        autoDensity: true,
      })

      initialized = true

      if (cancelled) {
        destroyApp()
        return
      }

      const grassLayer = new Graphics()
      const markingsLayer = new Graphics()

      drawGrass(grassLayer, width, height, 0)
      drawMarkings(markingsLayer, width, height, 0)

      container.textContent = ''
      container.appendChild(app.canvas)
      app.stage.addChild(grassLayer)
      app.stage.addChild(markingsLayer)
    }

    void mount()

    return () => {
      cancelled = true

      if (!initialized) {
        return
      }

      if (app.canvas.parentElement === container) {
        container.removeChild(app.canvas)
      }

      destroyApp()
    }
  }, [height, width])

  return <div ref={containerRef} className="pixi-canvas" />
}
