import { Container } from 'pixi.js'
import { gsap } from 'gsap'

const MIN_OFFSET_METERS = 0.4
const MAX_OFFSET_METERS = 1.5
const MIN_DURATION_SECONDS = 2.6
const MAX_DURATION_SECONDS = 4.4
const MAX_START_DELAY_SECONDS = 0.9

export type IdleMovementHandle = {
  setRunning: (running: boolean) => void
  stop: () => void
}

export type StartIdleMovementArgs = {
  visualGroups: Map<number, Container>
  idlePlayerNumbers: Set<number>
  pitchScale: number
  running: boolean
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function startIdleMovement({
  visualGroups,
  idlePlayerNumbers,
  pitchScale,
  running,
}: StartIdleMovementArgs): IdleMovementHandle {
  const tweens: gsap.core.Tween[] = []

  idlePlayerNumbers.forEach((playerNumber) => {
    const visualGroup = visualGroups.get(playerNumber)

    if (!visualGroup) {
      return
    }

    const offsetPx = randomBetween(MIN_OFFSET_METERS, MAX_OFFSET_METERS) * pitchScale
    const angle = Math.random() * Math.PI * 2

    tweens.push(
      gsap.to(visualGroup.position, {
        x: Math.cos(angle) * offsetPx,
        y: Math.sin(angle) * offsetPx,
        duration: randomBetween(MIN_DURATION_SECONDS, MAX_DURATION_SECONDS),
        delay: Math.random() * MAX_START_DELAY_SECONDS,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: !running,
      }),
    )
  })

  return {
    setRunning: (nextRunning: boolean) => {
      tweens.forEach((tween) => {
        if (nextRunning) {
          tween.play()
        } else {
          tween.pause()
        }
      })
    },
    stop: () => {
      tweens.forEach((tween) => {
        tween.kill()
      })
      visualGroups.forEach((visualGroup) => {
        visualGroup.position.set(0, 0)
      })
    },
  }
}

export const IDLE_MOVEMENT_GATED_SCENARIO_IDS: ReadonlySet<string> = new Set([
  'counter-quickly-on-turnover',
])
