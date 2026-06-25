import { Application, Container, Graphics, Sprite, Text } from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
import {
  buildScenarioAnimator,
  type AnimatorState,
  type ScenarioAnimator,
} from './animation/scenarioAnimator'
import { createAmbientShapeShift, type AmbientShapeShiftHandle } from './animation/ambientShapeShift'
import { createIdleMovement, type IdleMovementHandle } from './animation/idleMovement'
import { preloadTokenAssets } from './assets/preloadTokenAssets'
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
import {
  drawPlayers,
  getPlayerFocusMetrics,
  getPlayerTokenRadius,
} from './layers/PlayerLayer'
import { drawZones } from './layers/ZoneLayer'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations'
import { OPPOSITION_SQUAD } from '../../data/opponents'
import { PICKERING_SQUAD } from '../../data/squad'
import type { FormationPositionMap } from '../../data/formations'
import { PITCH, getZoneNumberForY } from '../../domain/pitch/pitchConstants'
import { getPitchScale, screenToPitch } from '../../domain/pitch/coordTransforms'
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

function isIdleMovementRunningState(state: AnimatorState): boolean {
  return state === 'playing' || state === 'complete'
}

type PlayerPhaseVisual = {
  tokenVisual: Sprite | Graphics
  numberText: Text
  focusGlow: Graphics
  focusRing: Graphics
  zoneNumber: number
}

// Away tokens stay slightly transparent at all times (no focus state applies
// to them), matching PlayerLayer's fixed away-side alpha at initial draw.
const AWAY_BASE_ALPHA = 0.58

type PhaseVisualRefs = {
  phaseHighlightLayer: Graphics
  arrowLayer: Graphics
  playerVisuals: Map<number, PlayerPhaseVisual>
  awayPlayerVisuals: Map<number, PlayerPhaseVisual>
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
  homePlayerTokenRefs: Map<number, Container>
  activePositions: FormationPositionMap
  homeIdleAnchorRefs: Map<number, Container>
  awayIdleAnchorRefs: Map<number, Container>
  pitchScale: number
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
  const animatorStateRef = useRef<AnimatorState>('idle')
  const idleControllersRef = useRef<{
    home: IdleMovementHandle
    away: IdleMovementHandle
    homeAnchors: Map<number, Container>
    awayAnchors: Map<number, Container>
  } | undefined>(undefined)
  const ambientShapeShiftRef = useRef<{
    controller: AmbientShapeShiftHandle
    playerTokens: Map<number, Container>
  } | undefined>(undefined)
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

      visual.tokenVisual.alpha = (hasActiveFocus && !isFocused ? 0.48 : 1) * zoneDimFactor
      visual.numberText.alpha = (hasActiveFocus && !isFocused ? 0.55 : 1) * zoneDimFactor
      visual.focusGlow.visible = isFocused
      visual.focusRing.visible = isFocused
    })

    drawZones(refs.zonesLayer, refs.stage, refs.width, refs.height, refs.pitchPadding, activeZones)

    refs.awayPlayerVisuals.forEach((visual) => {
      const isOutOfActiveZone = hasActiveZones && !activeZones.has(visual.zoneNumber)
      const zoneDimFactor = isOutOfActiveZone ? 0.45 : 1

      visual.tokenVisual.alpha = AWAY_BASE_ALPHA * zoneDimFactor
      visual.numberText.alpha = zoneDimFactor
    })

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
    const refs = phaseVisualRefs.current

    if (!refs) {
      idleControllersRef.current?.home.stop()
      idleControllersRef.current?.away.stop()
      idleControllersRef.current = undefined
      ambientShapeShiftRef.current?.controller.stop()
      ambientShapeShiftRef.current = undefined
      return undefined
    }

    const running = isIdleMovementRunningState(animatorStateRef.current)
    const anchorsChanged =
      idleControllersRef.current?.homeAnchors !== refs.homeIdleAnchorRefs ||
      idleControllersRef.current?.awayAnchors !== refs.awayIdleAnchorRefs

    if (anchorsChanged) {
      idleControllersRef.current?.home.stop()
      idleControllersRef.current?.away.stop()
      idleControllersRef.current = {
        home: createIdleMovement({
          visualGroups: refs.homeIdleAnchorRefs,
          pitchScale: refs.pitchScale,
          running,
        }),
        away: createIdleMovement({
          visualGroups: refs.awayIdleAnchorRefs,
          pitchScale: refs.pitchScale,
          running,
        }),
        homeAnchors: refs.homeIdleAnchorRefs,
        awayAnchors: refs.awayIdleAnchorRefs,
      }
    }

    const ambientPlayerTokensChanged =
      ambientShapeShiftRef.current?.playerTokens !== refs.homePlayerTokenRefs

    if (ambientPlayerTokensChanged) {
      ambientShapeShiftRef.current?.controller.stop()
      ambientShapeShiftRef.current = {
        controller: createAmbientShapeShift({
          playerTokens: refs.homePlayerTokenRefs,
          formationPositions: refs.activePositions,
          canvasW: refs.width,
          canvasH: refs.height,
          padding: refs.pitchPadding,
          running,
        }),
        playerTokens: refs.homePlayerTokenRefs,
      }
    }

    const controllers = idleControllersRef.current

    if (!controllers) {
      return undefined
    }

    const buildIdlePlayerNumbers = (anchorRefs: Map<number, Container>, excluded: Set<number>) =>
      new Set(
        Array.from(anchorRefs.keys()).filter(
          (playerNumber) => !excluded.has(playerNumber),
        ),
      )
    // keyPlayers in scenario data always refers to home-side numbers today -
    // no scenario scripts away-side keyPlayers yet, so the away exclusion set
    // stays empty until that exists (see Items D/E/B).
    const homeActivePlayerNumbers = new Set(activePhaseStep?.keyPlayers ?? [])
    const awayActivePlayerNumbers = new Set<number>()
    const ambientPlayerNumbers = new Set(
      Array.from(refs.homePlayerTokenRefs.keys()).filter((playerNumber) => {
        const player = PICKERING_SQUAD.find((squadPlayer) => squadPlayer.number === playerNumber)

        return Boolean(player && !player.isGoalkeeper && !homeActivePlayerNumbers.has(playerNumber))
      }),
    )

    controllers.home.update(buildIdlePlayerNumbers(refs.homeIdleAnchorRefs, homeActivePlayerNumbers))
    controllers.away.update(buildIdlePlayerNumbers(refs.awayIdleAnchorRefs, awayActivePlayerNumbers))
    ambientShapeShiftRef.current?.controller.update(ambientPlayerNumbers, activePhaseStep?.zoneFocus)

    return undefined
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
      await Promise.all([
        app.init({
          width,
          height,
          background: 0x1a1a1a,
          antialias: true,
          autoDensity: true,
        }),
        preloadTokenAssets(),
      ])

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
      const awayPlayerTokenRefs = new Map<number, Container>()
      const homeIdleAnchorRefs = new Map<number, Container>()
      const awayIdleAnchorRefs = new Map<number, Container>()
      const playerVisuals = new Map<number, PlayerPhaseVisual>()
      const awayPlayerVisuals = new Map<number, PlayerPhaseVisual>()
      const pitchScale = getPitchScale(width, height, pitchPadding)

      // Builds the focus-ring/glow overlay for a token and extracts the parts
      // the phase-tick effect mutates in place, so that effect never needs to
      // recreate Containers (which would orphan any in-flight GSAP tween).
      const buildPlayerPhaseVisual = (
        tokenContainer: Container,
        tokenRadius: number,
      ): Omit<PlayerPhaseVisual, 'zoneNumber'> | undefined => {
        const visualGroup = tokenContainer.children[0]

        if (!(visualGroup instanceof Container)) {
          return undefined
        }

        const numberText = visualGroup.children.find((child) => child instanceof Text)
        const tokenVisual =
          visualGroup.children.find((child) => child instanceof Sprite) ??
          visualGroup.children.filter((child) => child instanceof Graphics).at(-1)

        if (
          !(tokenVisual instanceof Sprite || tokenVisual instanceof Graphics) ||
          !(numberText instanceof Text)
        ) {
          return undefined
        }

        const { glowRadius, ringRadius, ringWidth } = getPlayerFocusMetrics(tokenRadius)
        const focusGlow = new Graphics()
        const focusRing = new Graphics()

        focusGlow.circle(0, 0, glowRadius)
        focusGlow.fill({ color: 0xfbbf24, alpha: 0.16 })
        focusGlow.visible = false
        focusRing.circle(0, 0, ringRadius)
        focusRing.stroke({ color: 0xfbbf24, width: ringWidth, alpha: 0.88 })
        focusRing.visible = false
        visualGroup.addChildAt(focusGlow, 1)
        visualGroup.addChildAt(focusRing, 2)

        return { tokenVisual, numberText, focusGlow, focusRing }
      }

      stage.addChild(grassLayer)
      stage.addChild(zonesLayer)
      stage.addChild(channelsLayer)
      stage.addChild(markingsLayer)
      stage.addChild(goalsLayer)
      stage.addChild(annotationLayer)
      stage.addChild(phaseHighlightLayer)
      stage.addChild(arrowLayer)
      stage.addChild(markerLayer)
      stage.addChild(awayPlayerLayer)
      stage.addChild(playerLayer)
      stage.addChild(ballLayer)
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
        drawPlayers(
          awayPlayerLayer,
          OPPOSITION_SQUAD,
          awayPositions,
          width,
          height,
          pitchPadding,
          undefined,
          awayPlayerTokenRefs,
          undefined,
          awayIdleAnchorRefs,
        )
        awayPlayerTokenRefs.forEach((tokenContainer, playerNumber) => {
          const awayPlayer = OPPOSITION_SQUAD.find((squadPlayer) => squadPlayer.number === playerNumber)

          if (!awayPlayer) {
            return
          }

          const awayTokenRadius = getPlayerTokenRadius(awayPlayer, pitchScale)
          const visual = buildPlayerPhaseVisual(tokenContainer, awayTokenRadius)

          if (!visual) {
            return
          }

          awayPlayerVisuals.set(playerNumber, {
            ...visual,
            zoneNumber: getZoneNumberForY(awayPositions[playerNumber]?.y ?? 0),
          })
        })
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
        undefined,
        homeIdleAnchorRefs,
      )
      homePlayerTokenRefs.forEach((tokenContainer, playerNumber) => {
        const player = PICKERING_SQUAD.find((squadPlayer) => squadPlayer.number === playerNumber)

        if (!player) {
          return
        }

        const tokenRadius = getPlayerTokenRadius(player, pitchScale)
        const visual = buildPlayerPhaseVisual(tokenContainer, tokenRadius)

        if (!visual) {
          return
        }

        playerVisuals.set(playerNumber, {
          ...visual,
          zoneNumber: getZoneNumberForY(activePositions[playerNumber]?.y ?? 0),
        })
      })
      drawScenarioMarkers(markerLayer, showMarkers ? selectedMarkers : undefined, width, height, pitchPadding)
      const ballToken = drawBall(ballLayer, showBall ? selectedBallStart : undefined, width, height, pitchPadding)

      phaseVisualRefs.current = {
        phaseHighlightLayer,
        arrowLayer,
        playerVisuals,
        awayPlayerVisuals,
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
        homePlayerTokenRefs,
        activePositions,
        homeIdleAnchorRefs,
        awayIdleAnchorRefs,
        pitchScale,
      }
      setPhaseVisualVersion((version) => version + 1)

      const handleAnimatorStateChange = (state: AnimatorState) => {
        animatorStateRef.current = state
        idleControllersRef.current?.home.setRunning(isIdleMovementRunningState(state))
        idleControllersRef.current?.away.setRunning(isIdleMovementRunningState(state))
        ambientShapeShiftRef.current?.controller.setRunning(isIdleMovementRunningState(state))
        onStateChange?.(state)
      }

      scenarioAnimator = buildScenarioAnimator({
        scenario: selectedScenario,
        homePlayerTokens: homePlayerTokenRefs,
        awayPlayerTokens: awayPlayerTokenRefs,
        ballToken,
        canvasW: width,
        canvasH: height,
        padding: pitchPadding,
        onStateChange: handleAnimatorStateChange,
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

      idleControllersRef.current?.home.stop()
      idleControllersRef.current?.away.stop()
      idleControllersRef.current = undefined
      ambientShapeShiftRef.current?.controller.stop()
      ambientShapeShiftRef.current = undefined

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
