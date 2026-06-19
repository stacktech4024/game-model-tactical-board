import { Application, Container, Graphics, Text } from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
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
import { drawPhaseHighlights } from './layers/PhaseHighlightLayer'
import { drawPlayers } from './layers/PlayerLayer'
import { drawZones } from './layers/ZoneLayer'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations'
import { OPPOSITION_SQUAD } from '../../data/opponents'
import { PICKERING_SQUAD } from '../../data/squad'
import { PITCH, getZoneNumberForY } from '../../domain/pitch/pitchConstants'
import { screenToPitch } from '../../domain/pitch/coordTransforms'
import type {
  ScenarioAnnotations,
  ScenarioArrow,
  ScenarioDefinition,
  ScenarioFormationMode,
  ScenarioMarker,
  ScenarioPhaseStep,
} from '../../domain/scenarios/scenarioTypes'

type BallStart = {
  x: number
  y: number
}

type PlayerPhaseVisual = {
  tokenFill: Graphics
  numberText: Text
  focusGlow: Graphics
  focusRing: Graphics
  zoneNumber: number
}

type PhaseVisualRefs = {
  phaseHighlightLayer: Graphics
  arrowLayer: Graphics
  playerVisuals: Map<number, PlayerPhaseVisual>
  selectedArrows?: ScenarioArrow[]
  showArrows: boolean
  width: number
  height: number
  pitchPadding: number
  zonesLayer: Graphics
  stage: Container
  awayPlayerLayer: Container
  awayPositions: Record<number, { x: number; y: number }>
  showOpposition: boolean
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
  activePhaseStep?: ScenarioPhaseStep
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
  activePhaseStep,
  showAnnotations = true,
  showArrows = true,
  showMarkers = true,
  showOpposition = true,
  showBall = true,
  onAnimatorReady,
  onStateChange,
}: PixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const phaseVisualRefs = useRef<PhaseVisualRefs | undefined>(undefined)
  const [phaseVisualVersion, setPhaseVisualVersion] = useState(0)

  useEffect(() => {
    const refs = phaseVisualRefs.current

    if (!refs) {
      return
    }

    const focusedPlayerNumbers = new Set(activePhaseStep?.keyPlayers ?? [])
    const activeArrowIds = new Set(activePhaseStep?.relatedArrows ?? [])
    const activeZones = new Set<number>(activePhaseStep?.zoneFocus ?? [])
    const hasActiveFocus = Boolean(focusedPlayerNumbers.size)
    const hasActiveZones = Boolean(activeZones.size)

    refs.playerVisuals.forEach((visual, playerNumber) => {
      const isFocused = focusedPlayerNumbers.has(playerNumber)
      const isOutOfActiveZone = hasActiveZones && !activeZones.has(visual.zoneNumber)
      const zoneDimFactor = isOutOfActiveZone ? 0.45 : 1

      visual.tokenFill.alpha = (hasActiveFocus && !isFocused ? 0.48 : 1) * zoneDimFactor
      visual.numberText.alpha = (hasActiveFocus && !isFocused ? 0.55 : 1) * zoneDimFactor
      visual.focusGlow.visible = isFocused
      visual.focusRing.visible = isFocused
    })

    drawZones(refs.zonesLayer, refs.stage, refs.width, refs.height, refs.pitchPadding, activeZones)

    if (refs.showOpposition) {
      drawPlayers(
        refs.awayPlayerLayer,
        OPPOSITION_SQUAD,
        refs.awayPositions,
        refs.width,
        refs.height,
        refs.pitchPadding,
        undefined,
        undefined,
        activeZones,
      )
    }

    drawPhaseHighlights(
      refs.phaseHighlightLayer,
      activePhaseStep,
      refs.width,
      refs.height,
      refs.pitchPadding,
    )
    drawScenarioArrows(
      refs.arrowLayer,
      refs.showArrows ? refs.selectedArrows : undefined,
      refs.width,
      refs.height,
      refs.pitchPadding,
      activeArrowIds,
    )
  }, [activePhaseStep, phaseVisualVersion])

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
      const phaseHighlightLayer = new Graphics()
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
      const playerVisuals = new Map<number, PlayerPhaseVisual>()

      stage.addChild(grassLayer)
      stage.addChild(zonesLayer)
      stage.addChild(channelsLayer)
      stage.addChild(markingsLayer)
      stage.addChild(goalsLayer)
      stage.addChild(annotationLayer)
      stage.addChild(phaseHighlightLayer)
      stage.addChild(arrowLayer)
      stage.addChild(markerLayer)
      stage.addChild(ballLayer)
      stage.addChild(awayPlayerLayer)
      stage.addChild(playerLayer)
      stage.addChild(debugLayer)

      container.textContent = ''
      container.appendChild(app.canvas)

      drawGrass(grassLayer, width, height, pitchPadding)
      drawZones(zonesLayer, stage, width, height, pitchPadding)
      drawChannels(channelsLayer, width, height, pitchPadding)
      drawMarkings(markingsLayer, width, height, pitchPadding)
      drawGoals(goalsLayer, width, height, pitchPadding)
      drawAnnotations(annotationLayer, showAnnotations ? selectedAnnotations : undefined, width, height, pitchPadding)
      drawPhaseHighlights(phaseHighlightLayer, undefined, width, height, pitchPadding)
      drawScenarioArrows(arrowLayer, showArrows ? selectedArrows : undefined, width, height, pitchPadding)

      if (showOpposition) {
        drawPlayers(awayPlayerLayer, OPPOSITION_SQUAD, awayPositions, width, height, pitchPadding)
      } else {
        awayPlayerLayer.removeChildren()
      }

      drawPlayers(
        playerLayer,
        PICKERING_SQUAD,
        activePositions,
        width,
        height,
        pitchPadding,
        undefined,
        homePlayerTokenRefs,
      )
      homePlayerTokenRefs.forEach((tokenContainer, playerNumber) => {
        const player = PICKERING_SQUAD.find((squadPlayer) => squadPlayer.number === playerNumber)
        const tokenFill = tokenContainer.children[1]
        const numberText = tokenContainer.children[2]

        if (!(tokenFill instanceof Graphics) || !(numberText instanceof Text)) {
          return
        }

        const tokenRadius = player?.isGoalkeeper ? 17 : 14
        const focusGlow = new Graphics()
        const focusRing = new Graphics()

        focusGlow.circle(0, 0, tokenRadius + 9)
        focusGlow.fill({ color: 0xfbbf24, alpha: 0.16 })
        focusGlow.visible = false
        focusRing.circle(0, 0, tokenRadius + 5)
        focusRing.stroke({ color: 0xfbbf24, width: 3.5, alpha: 0.88 })
        focusRing.visible = false
        tokenContainer.addChildAt(focusGlow, 1)
        tokenContainer.addChildAt(focusRing, 2)
        playerVisuals.set(playerNumber, {
          tokenFill,
          numberText,
          focusGlow,
          focusRing,
          zoneNumber: getZoneNumberForY(activePositions[playerNumber]?.y ?? 0),
        })
      })
      drawScenarioMarkers(markerLayer, showMarkers ? selectedMarkers : undefined, width, height, pitchPadding)
      const ballToken = drawBall(ballLayer, showBall ? selectedBallStart : undefined, width, height, pitchPadding)

      phaseVisualRefs.current = {
        phaseHighlightLayer,
        arrowLayer,
        playerVisuals,
        selectedArrows,
        showArrows,
        width,
        height,
        pitchPadding,
        zonesLayer,
        stage,
        awayPlayerLayer,
        awayPositions,
        showOpposition,
      }
      setPhaseVisualVersion((version) => version + 1)

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
      phaseVisualRefs.current = undefined

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
