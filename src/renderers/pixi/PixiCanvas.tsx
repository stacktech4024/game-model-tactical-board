import { Application, Container, Graphics, Text } from 'pixi.js'
import { useEffect, useRef } from 'react'
import {
  buildScenarioAnimator,
  type AnimatorState,
  type ScenarioAnimator,
} from './animation/scenarioAnimator'
import { drawAnnotations } from './layers/AnnotationLayer'
import { drawScenarioArrows } from './layers/ArrowLayer'
import { drawBall } from './layers/BallLayer'
import { drawChannels } from './layers/ChannelLayer'
import { drawDebug } from './layers/DebugLayer'
import { drawGrass } from './layers/GrassLayer'
import { drawGoals } from './layers/GoalLayer'
import { drawMarkings } from './layers/MarkingsLayer'
import { drawScenarioMarkers } from './layers/MarkerLayer'
import { drawPlayers } from './layers/PlayerLayer'
import { drawZones } from './layers/ZoneLayer'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations'
import { OPPOSITION_SQUAD } from '../../data/opponents'
import { PICKERING_SQUAD } from '../../data/squad'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { screenToPitch } from '../../domain/pitch/coordTransforms'
import type {
  ScenarioAnnotations,
  ScenarioArrow,
  ScenarioDefinition,
  ScenarioFormationMode,
  ScenarioMarker,
} from '../../domain/scenarios/scenarioTypes'

type BallStart = {
  x: number
  y: number
}

type PixiCanvasProps = {
  width: number
  height: number
  debugMode?: boolean
  selectedFormation: ScenarioFormationMode
  // TODO CP29: consolidate scenario-derived props so PixiCanvas receives either selectedScenario or derived render props, not both.
  selectedScenario: ScenarioDefinition
  selectedBallStart?: BallStart
  selectedAnnotations?: ScenarioAnnotations
  selectedArrows?: ScenarioArrow[]
  selectedMarkers?: ScenarioMarker[]
  showAnnotations?: boolean
  showArrows?: boolean
  showMarkers?: boolean
  showOpposition?: boolean
  showBall?: boolean
  onAnimatorReady?: (animator: ScenarioAnimator) => void
  onStateChange?: (state: AnimatorState) => void
}

export function PixiCanvas({
  width,
  height,
  debugMode = false,
  selectedFormation,
  selectedScenario,
  selectedBallStart,
  selectedAnnotations,
  selectedArrows,
  selectedMarkers,
  showAnnotations = true,
  showArrows = true,
  showMarkers = true,
  showOpposition = true,
  showBall = true,
  onAnimatorReady,
  onStateChange,
}: PixiCanvasProps) {
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
    let removePointerMoveListener: (() => void) | undefined
    let scenarioAnimator: ScenarioAnimator | undefined

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
      const annotationLayer = new Graphics()
      const markingsLayer = new Graphics()
      const channelsLayer = new Graphics()
      const goalsLayer = new Graphics()
      const arrowLayer = new Graphics()
      const awayPlayerLayer = new Container()
      const playerLayer = new Container()
      const markerLayer = new Container()
      const ballLayer = new Container()
      const debugLayer = new Graphics()
      const stage: Container = app.stage
      const activePositions = FORMATION_POSITIONS[selectedFormation]
      const awayPositions = OPPOSITION_POSITIONS[selectedFormation]
      const homePlayerTokenRefs = new Map<number, Container>()

      stage.addChild(grassLayer)
      stage.addChild(zonesLayer)
      stage.addChild(annotationLayer)
      stage.addChild(markingsLayer)
      stage.addChild(channelsLayer)
      stage.addChild(goalsLayer)
      stage.addChild(arrowLayer)
      stage.addChild(awayPlayerLayer)
      stage.addChild(playerLayer)
      stage.addChild(markerLayer)
      stage.addChild(ballLayer)
      stage.addChild(debugLayer)

      container.textContent = ''
      container.appendChild(app.canvas)

      drawGrass(grassLayer, width, height, pitchPadding)
      drawZones(zonesLayer, stage, width, height, pitchPadding)
      drawAnnotations(annotationLayer, showAnnotations ? selectedAnnotations : undefined, width, height, pitchPadding)
      drawMarkings(markingsLayer, width, height, pitchPadding)
      drawChannels(channelsLayer, width, height, pitchPadding)
      drawGoals(goalsLayer, width, height, pitchPadding)
      drawScenarioArrows(arrowLayer, showArrows ? selectedArrows : undefined, width, height, pitchPadding)

      if (showOpposition) {
        drawPlayers(awayPlayerLayer, OPPOSITION_SQUAD, awayPositions, width, height, pitchPadding)
      } else {
        awayPlayerLayer.removeChildren()
      }

      drawPlayers(playerLayer, PICKERING_SQUAD, activePositions, width, height, pitchPadding, homePlayerTokenRefs)
      drawScenarioMarkers(markerLayer, showMarkers ? selectedMarkers : undefined, width, height, pitchPadding)
      const ballToken = drawBall(ballLayer, showBall ? selectedBallStart : undefined, width, height, pitchPadding)

      scenarioAnimator = buildScenarioAnimator({
        scenario: selectedScenario,
        playerTokens: homePlayerTokenRefs,
        ballToken,
        canvasW: width,
        canvasH: height,
        padding: pitchPadding,
        onStateChange,
      })
      onAnimatorReady?.(scenarioAnimator)

      if (debugMode) {
        drawDebug(debugLayer, app.stage, width, height, pitchPadding)
      }

      if (debugMode) {
        const readoutText = new Text({
          text: 'outside pitch',
          style: {
            fill: 0xf59e0b,
            fontSize: 12,
            fontFamily: 'Arial',
          },
        })

        readoutText.position.set(12, 10)
        stage.addChild(readoutText)

        const handlePointerMove = (event: PointerEvent) => {
          const rect = app.canvas.getBoundingClientRect()
          const sx = ((event.clientX - rect.left) / rect.width) * width
          const sy = ((event.clientY - rect.top) / rect.height) * height
          const { x, y } = screenToPitch(sx, sy, width, height, pitchPadding)
          const insidePitch =
            x >= 0 && x <= PITCH.WIDTH && y >= 0 && y <= PITCH.LENGTH

          readoutText.text = insidePitch
            ? `x: ${x.toFixed(2)}m, y: ${y.toFixed(2)}m`
            : 'outside pitch'
        }

        app.canvas.addEventListener('pointermove', handlePointerMove)
        removePointerMoveListener = () => {
          app.canvas.removeEventListener('pointermove', handlePointerMove)
        }
      }
    }

    void mount()

    return () => {
      cancelled = true

      removePointerMoveListener?.()
      removePointerMoveListener = undefined
      scenarioAnimator?.destroy()
      scenarioAnimator = undefined

      if (!initialized) {
        return
      }

      if (app.canvas.parentElement === container) {
        container.removeChild(app.canvas)
      }

      destroyApp()
    }
  }, [
    debugMode,
    height,
    selectedAnnotations,
    selectedArrows,
    selectedBallStart,
    selectedFormation,
    selectedScenario,
    selectedMarkers,
    onAnimatorReady,
    onStateChange,
    showAnnotations,
    showArrows,
    showBall,
    showMarkers,
    showOpposition,
    width,
  ])

  return <div ref={containerRef} className="pixi-canvas" />
}
