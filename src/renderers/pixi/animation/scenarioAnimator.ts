import { Container, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import {
  buildScenarioPlan,
  VIA_SEGMENT_GAP,
  type FormationPositions,
} from '../../../domain/simulation/scenarioPlan'
import type { PitchPoint, ScenarioArrow, ScenarioDefinition } from '../../../domain/scenarios/scenarioTypes'
import {
  getBallPlaybackTween,
  getPlayerPlaybackTween,
  getRotationFromPitchVector,
  type BallPlaybackTween,
  type PlayerPlaybackTween,
} from './snapshotPlaybackAdapter'

const SHOT_IMPACT_SCALE = 1.25
const SHOT_IMPACT_DURATION = 0.12
const DEFAULT_ARROW_DELAY = 0

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
  formationPositions: FormationPositions
  awayFormationPositions?: FormationPositions
  homePlayerTokens: Map<number, Container>
  awayPlayerTokens?: Map<number, Container>
  homePlayerSprites?: Map<number, Sprite>
  awayPlayerSprites?: Map<number, Sprite>
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

function playbackTweenToPosition(tween: BallPlaybackTween | PlayerPlaybackTween): TokenPosition {
  return {
    x: tween.targetScreenPosition.sx,
    y: tween.targetScreenPosition.sy,
  }
}

export function buildScenarioAnimator({
  scenario,
  formationPositions,
  awayFormationPositions,
  homePlayerTokens,
  awayPlayerTokens,
  homePlayerSprites,
  awayPlayerSprites,
  ballToken,
  canvasW,
  canvasH,
  padding,
  onStateChange,
}: BuildScenarioAnimatorArgs): ScenarioAnimator {
  let state: AnimatorState = 'idle'
  const initialPositions = new Map<Container, TokenPosition>()
  const initialRotations = new Map<Sprite, number>()
  const plan = buildScenarioPlan(scenario, formationPositions, awayFormationPositions)
  const intentByArrowId = new Map(plan.animationIntents.map((intent) => [intent.arrowId, intent]))
  const totalDuration = plan.animationIntents.at(-1)?.timing.endTime ?? 0
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

  const rememberInitialRotation = (sprite: Sprite) => {
    if (initialRotations.has(sprite)) {
      return
    }

    initialRotations.set(sprite, sprite.rotation)
  }

  const getProgressAtTime = (time: number) => (
    totalDuration > 0 ? time / totalDuration : 0
  )

  getSortedArrows(scenario.arrows).forEach((arrow) => {
    const intent = intentByArrowId.get(arrow.id)

    if (!intent) {
      return
    }

    const delay = arrow.delay ?? DEFAULT_ARROW_DELAY
    const start = pointToPosition(arrow.from, canvasW, canvasH, padding)
    const hasVia = Boolean(arrow.via)
    // scenarioPlan.ts bakes VIA_SEGMENT_GAP into timing.duration for via arrows
    // (duration = moveDuration + VIA_SEGMENT_GAP), so subtract it back out
    // to recover the same per-segment moveDuration the old hardcoded
    // BALL_MOVE_DURATION/SHOT_MOVE_DURATION/PLAYER_MOVE_DURATION produced.
    const moveDuration = hasVia ? intent.timing.duration - VIA_SEGMENT_GAP : intent.timing.duration

    if (isBallArrow(arrow)) {
      if (!ballToken) {
        return
      }

      const isShot = arrow.type === 'shot'
      const endTween = getBallPlaybackTween(
        plan,
        intent.timing.startProgress,
        intent.timing.endProgress,
        canvasW,
        canvasH,
        padding,
      )

      if (!endTween) {
        return
      }

      rememberInitialPosition(ballToken)
      timeline.set(ballToken.position, start, `+=${delay}`)

      // A shot needs a visible "this player struck it" cue, or the ball
      // just appears to glide there on its own.
      //
      // releasedBy (when present) is the domain-verified player actually
      // standing at the ball's release point - it can differ from the
      // arrow's own playerNumber label, which is sometimes just the
      // descriptive name on the arrow (see e.g. wing-back-shot-goal, where
      // releasedBy correctly points to #10 even though the arrow is
      // labeled #9). Prefer releasedBy so the highlighted token matches
      // where the shot actually originates; fall back to arrow.playerNumber
      // only for loose-ball releases, which have no specific release player.
      const strikerSide = intent.releasedBy?.side ?? arrow.side
      const strikerPlayerNumber = intent.releasedBy?.playerNumber ?? arrow.playerNumber

      if (isShot && strikerPlayerNumber) {
        const strikerTokens = strikerSide === 'away' ? awayPlayerTokens : homePlayerTokens
        const strikerToken = strikerTokens?.get(strikerPlayerNumber)

        if (strikerToken) {
          rememberInitialPosition(strikerToken)
          timeline.to(strikerToken.scale, {
            x: SHOT_IMPACT_SCALE,
            y: SHOT_IMPACT_SCALE,
            duration: SHOT_IMPACT_DURATION,
            ease: 'power1.out',
            yoyo: true,
            repeat: 1,
          }, '<')
        }
      }

      if (hasVia) {
        const segmentDuration = moveDuration / 2
        const viaProgress = getProgressAtTime(intent.timing.startTime + segmentDuration)
        const secondSegmentStartProgress = getProgressAtTime(
          intent.timing.startTime + segmentDuration + VIA_SEGMENT_GAP,
        )
        const viaTween = getBallPlaybackTween(
          plan,
          intent.timing.startProgress,
          viaProgress,
          canvasW,
          canvasH,
          padding,
        )
        const finalTween = getBallPlaybackTween(
          plan,
          secondSegmentStartProgress,
          intent.timing.endProgress,
          canvasW,
          canvasH,
          padding,
        )

        if (!viaTween || !finalTween) {
          return
        }

        timeline.to(ballToken.position, {
          ...playbackTweenToPosition(viaTween),
          duration: viaTween.durationSeconds,
          ease: viaTween.ease,
        })
        timeline.to(ballToken.position, {
          ...playbackTweenToPosition(finalTween),
          duration: finalTween.durationSeconds,
          ease: finalTween.ease,
        }, `+=${VIA_SEGMENT_GAP}`)
      } else {
        timeline.to(ballToken.position, {
          ...playbackTweenToPosition(endTween),
          duration: endTween.durationSeconds,
          ease: endTween.ease,
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

      const playerSprites = arrow.side === 'away' ? awayPlayerSprites : homePlayerSprites
      const playerSprite = playerSprites?.get(arrow.playerNumber)

      rememberInitialPosition(playerToken)
      timeline.set(playerToken.position, start, `+=${delay}`)

      if (playerSprite) {
        rememberInitialRotation(playerSprite)
      }

      const endTween = getPlayerPlaybackTween(
        plan,
        intent.side,
        arrow.playerNumber,
        intent.timing.startProgress,
        intent.timing.endProgress,
        canvasW,
        canvasH,
        padding,
      )

      if (!endTween) {
        return
      }

      if (hasVia) {
        const segmentDuration = moveDuration / 2
        const viaProgress = getProgressAtTime(intent.timing.startTime + segmentDuration)
        const secondSegmentStartProgress = getProgressAtTime(
          intent.timing.startTime + segmentDuration + VIA_SEGMENT_GAP,
        )
        const viaTween = getPlayerPlaybackTween(
          plan,
          intent.side,
          arrow.playerNumber,
          intent.timing.startProgress,
          viaProgress,
          canvasW,
          canvasH,
          padding,
        )
        const finalTween = getPlayerPlaybackTween(
          plan,
          intent.side,
          arrow.playerNumber,
          secondSegmentStartProgress,
          intent.timing.endProgress,
          canvasW,
          canvasH,
          padding,
        )

        if (!viaTween || !finalTween) {
          return
        }

        timeline.to(playerToken.position, {
          ...playbackTweenToPosition(viaTween),
          duration: viaTween.durationSeconds,
          ease: viaTween.ease,
        })

        if (playerSprite) {
          const viaRotation = getRotationFromPitchVector(arrow.from, arrow.via as PitchPoint)

          if (viaRotation !== undefined) {
            timeline.to(playerSprite, {
              rotation: viaRotation,
              duration: viaTween.durationSeconds,
              ease: viaTween.ease,
            }, '<')
          }
        }

        timeline.to(playerToken.position, {
          ...playbackTweenToPosition(finalTween),
          duration: finalTween.durationSeconds,
          ease: finalTween.ease,
        }, `+=${VIA_SEGMENT_GAP}`)

        if (playerSprite) {
          const finalRotation = getRotationFromPitchVector(arrow.via as PitchPoint, arrow.to)

          if (finalRotation !== undefined) {
            timeline.to(playerSprite, {
              rotation: finalRotation,
              duration: finalTween.durationSeconds,
              ease: finalTween.ease,
            }, '<')
          }
        }
      } else {
        timeline.to(playerToken.position, {
          ...playbackTweenToPosition(endTween),
          duration: endTween.durationSeconds,
          ease: endTween.ease,
        })

        if (playerSprite) {
          const rotation = getRotationFromPitchVector(arrow.from, arrow.to)

          if (rotation !== undefined) {
            timeline.to(playerSprite, {
              rotation,
              duration: endTween.durationSeconds,
              ease: endTween.ease,
            }, '<')
          }
        }
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
    initialRotations.forEach((rotation, sprite) => {
      sprite.rotation = rotation
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
