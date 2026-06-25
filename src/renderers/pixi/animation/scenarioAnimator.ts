import { Container } from 'pixi.js'
import { gsap } from 'gsap'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { PitchPoint, ScenarioArrow, ScenarioDefinition } from '../../../domain/scenarios/scenarioTypes'

const BALL_MOVE_DURATION = 0.7
const PLAYER_MOVE_DURATION = 1.15
const DEFAULT_ARROW_DELAY = 0
const SEGMENT_GAP = 0.16

export type AnimatorState = 'idle' | 'playing' | 'paused' | 'complete'

export type ScenarioAnimator = {
  play: () => void
  pause: () => void
  reset: () => void
  destroy: () => void
  getState: () => AnimatorState
  getProgress: () => number
  setProgress: (progress: number) => void
}

export type BuildScenarioAnimatorArgs = {
  scenario: ScenarioDefinition
  homePlayerTokens: Map<number, Container>
  awayPlayerTokens?: Map<number, Container>
  ballToken: Container | undefined
  canvasW: number
  canvasH: number
  padding: number
  onStateChange?: (state: AnimatorState) => void
}

type TokenPosition = {
  x: number
  y: number
}

function isBallArrow(arrow: ScenarioArrow): boolean {
  return arrow.type === 'pass' || arrow.type === 'dribble' || arrow.type === 'shot'
}

function isPlayerArrow(arrow: ScenarioArrow): boolean {
  return arrow.type === 'run' || arrow.type === 'press' || arrow.type === 'recovery'
}

function getSortedArrows(arrows: ScenarioArrow[] | undefined): ScenarioArrow[] {
  return [...(arrows ?? [])].sort((arrowA, arrowB) => {
    const orderA = arrowA.order ?? Number.MAX_SAFE_INTEGER
    const orderB = arrowB.order ?? Number.MAX_SAFE_INTEGER

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return (arrows ?? []).indexOf(arrowA) - (arrows ?? []).indexOf(arrowB)
  })
}

function pointToPosition(
  point: PitchPoint,
  canvasW: number,
  canvasH: number,
  padding: number,
): TokenPosition {
  const screenPoint = pitchToScreen(point.x, point.y, canvasW, canvasH, padding)

  return { x: screenPoint.sx, y: screenPoint.sy }
}

export function buildScenarioAnimator({
  scenario,
  homePlayerTokens,
  awayPlayerTokens,
  ballToken,
  canvasW,
  canvasH,
  padding,
  onStateChange,
}: BuildScenarioAnimatorArgs): ScenarioAnimator {
  let state: AnimatorState = 'idle'
  const initialPositions = new Map<Container, TokenPosition>()
  const timeline = gsap.timeline({
    paused: true,
    onComplete: () => {
      state = 'complete'
      onStateChange?.('complete')
    },
  })

  const rememberInitialPosition = (token: Container) => {
    if (initialPositions.has(token)) {
      return
    }

    initialPositions.set(token, { x: token.position.x, y: token.position.y })
  }

  getSortedArrows(scenario.arrows).forEach((arrow) => {
    const delay = arrow.delay ?? DEFAULT_ARROW_DELAY
    const start = pointToPosition(arrow.from, canvasW, canvasH, padding)
    const via = arrow.via ? pointToPosition(arrow.via, canvasW, canvasH, padding) : undefined
    const end = pointToPosition(arrow.to, canvasW, canvasH, padding)

    if (isBallArrow(arrow)) {
      if (!ballToken) {
        return
      }

      rememberInitialPosition(ballToken)
      timeline.set(ballToken.position, start, `+=${delay}`)

      if (via) {
        timeline.to(ballToken.position, {
          ...via,
          duration: BALL_MOVE_DURATION / 2,
          ease: 'power1.inOut',
        })
        timeline.to(ballToken.position, {
          ...end,
          duration: BALL_MOVE_DURATION / 2,
          ease: 'power1.inOut',
        }, `+=${SEGMENT_GAP}`)
      } else {
        timeline.to(ballToken.position, {
          ...end,
          duration: BALL_MOVE_DURATION,
          ease: 'power1.inOut',
        })
      }

      return
    }

    if (isPlayerArrow(arrow)) {
      if (!arrow.playerNumber) {
        return
      }

      const playerTokens = arrow.side === 'away' ? awayPlayerTokens : homePlayerTokens
      const playerToken = playerTokens?.get(arrow.playerNumber)

      if (!playerToken) {
        return
      }

      rememberInitialPosition(playerToken)
      timeline.set(playerToken.position, start, `+=${delay}`)

      if (via) {
        timeline.to(playerToken.position, {
          ...via,
          duration: PLAYER_MOVE_DURATION / 2,
          ease: 'power2.inOut',
        })
        timeline.to(playerToken.position, {
          ...end,
          duration: PLAYER_MOVE_DURATION / 2,
          ease: 'power2.inOut',
        }, `+=${SEGMENT_GAP}`)
      } else {
        timeline.to(playerToken.position, {
          ...end,
          duration: PLAYER_MOVE_DURATION,
          ease: 'power2.inOut',
        })
      }
    }
  })

  const setState = (nextState: AnimatorState) => {
    state = nextState
    onStateChange?.(nextState)
  }

  const restoreInitialPositions = () => {
    initialPositions.forEach((position, token) => {
      token.position.set(position.x, position.y)
    })
  }

  return {
    play: () => {
      if (state === 'complete') {
        timeline.progress(0)
        restoreInitialPositions()
      }

      setState('playing')
      timeline.play()
    },
    pause: () => {
      timeline.pause()
      setState('paused')
    },
    reset: () => {
      timeline.pause()
      timeline.progress(0)
      restoreInitialPositions()
      setState('idle')
    },
    destroy: () => {
      timeline.kill()
      setState('idle')
    },
    getState: () => state,
    getProgress: () => timeline.progress(),
    setProgress: (progress: number) => {
      timeline.progress(Math.min(1, Math.max(0, progress)))
      state = progress >= 1 ? 'complete' : 'paused'
    },
  }
}
