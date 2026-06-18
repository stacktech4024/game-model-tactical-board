import { Container } from 'pixi.js'
import { gsap } from 'gsap'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { ScenarioArrow, ScenarioDefinition } from '../../../domain/scenarios/scenarioTypes'

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
  playerTokens: Map<number, Container>
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
  return arrow.type === 'pass' || arrow.type === 'dribble'
}

function isPlayerArrow(arrow: ScenarioArrow): boolean {
  return arrow.type === 'run' || arrow.type === 'press' || arrow.type === 'recovery'
}

export function buildScenarioAnimator({
  scenario,
  playerTokens,
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

  scenario.arrows?.forEach((arrow) => {
    const end = pitchToScreen(arrow.to.x, arrow.to.y, canvasW, canvasH, padding)

    if (isBallArrow(arrow)) {
      if (!ballToken) {
        return
      }

      const start = pitchToScreen(arrow.from.x, arrow.from.y, canvasW, canvasH, padding)

      rememberInitialPosition(ballToken)
      timeline.set(ballToken.position, { x: start.sx, y: start.sy })
      timeline.to(ballToken.position, {
        x: end.sx,
        y: end.sy,
        duration: arrow.type === 'dribble' ? 0.6 : 0.5,
        ease: 'power1.inOut',
      })
      return
    }

    if (isPlayerArrow(arrow)) {
      if (!arrow.playerNumber) {
        return
      }

      const playerToken = playerTokens.get(arrow.playerNumber)

      if (!playerToken) {
        return
      }

      const start = pitchToScreen(arrow.from.x, arrow.from.y, canvasW, canvasH, padding)

      rememberInitialPosition(playerToken)
      timeline.set(playerToken.position, { x: start.sx, y: start.sy })
      timeline.to(playerToken.position, {
        x: end.sx,
        y: end.sy,
        duration: 0.8,
        ease: 'power2.inOut',
      })
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
