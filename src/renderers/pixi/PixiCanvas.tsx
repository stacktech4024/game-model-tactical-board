import { Application, Container, Graphics } from 'pixi.js'
import { useEffect, useRef } from 'react'
import { drawChannels } from './layers/ChannelLayer'
import { drawGrass } from './layers/GrassLayer'
import { drawGoals } from './layers/GoalLayer'
import { drawMarkings } from './layers/MarkingsLayer'
import { drawZones } from './layers/ZoneLayer'

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
    const pitchPadding = 32

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
      const zonesLayer = new Graphics()
      const markingsLayer = new Graphics()
      const channelsLayer = new Graphics()
      const goalsLayer = new Graphics()
      const stage: Container = app.stage

      stage.addChild(grassLayer)
      stage.addChild(zonesLayer)
      stage.addChild(markingsLayer)
      stage.addChild(channelsLayer)
      stage.addChild(goalsLayer)

      container.textContent = ''
      container.appendChild(app.canvas)

      drawGrass(grassLayer, width, height, pitchPadding)
      drawZones(zonesLayer, stage, width, height, pitchPadding)
      drawMarkings(markingsLayer, width, height, pitchPadding)
      drawChannels(channelsLayer, width, height, pitchPadding)
      drawGoals(goalsLayer, width, height, pitchPadding)
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
