import { Container } from 'pixi.js'
import { gsap } from 'gsap'

const MIN_OFFSET_METERS = 0.4
const MAX_OFFSET_METERS = 1.5
const MIN_DURATION_SECONDS = 2.6
const MAX_DURATION_SECONDS = 4.4
const MAX_START_DELAY_SECONDS = 0.9

export type IdleMovementHandle = {
  update: (idlePlayerNumbers: Set<number>) => void
  setRunning: (running: boolean) => void
  stop: () => void
}

export type CreateIdleMovementArgs = {
  visualGroups: Map<number, Container>
  pitchScale: number
  running: boolean
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function startWander(visualGroup: Container, pitchScale: number, running: boolean): gsap.core.Tween {
  const offsetPx = randomBetween(MIN_OFFSET_METERS, MAX_OFFSET_METERS) * pitchScale
  const angle = Math.random() * Math.PI * 2

  return gsap.to(visualGroup.position, {
    x: Math.cos(angle) * offsetPx,
    y: Math.sin(angle) * offsetPx,
    duration: randomBetween(MIN_DURATION_SECONDS, MAX_DURATION_SECONDS),
    delay: Math.random() * MAX_START_DELAY_SECONDS,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    paused: !running,
  })
}

export function createIdleMovement({
  visualGroups,
  pitchScale,
  running,
}: CreateIdleMovementArgs): IdleMovementHandle {
  const activeTweens = new Map<number, gsap.core.Tween>()
  let isRunning = running

  return {
    update: (idlePlayerNumbers: Set<number>) => {
      activeTweens.forEach((tween, playerNumber) => {
        if (!idlePlayerNumbers.has(playerNumber)) {
          tween.kill()
          activeTweens.delete(playerNumber)
          visualGroups.get(playerNumber)?.position.set(0, 0)
        }
      })

      idlePlayerNumbers.forEach((playerNumber) => {
        if (activeTweens.has(playerNumber)) {
          return
        }

        const visualGroup = visualGroups.get(playerNumber)

        if (!visualGroup) {
          return
        }

        activeTweens.set(playerNumber, startWander(visualGroup, pitchScale, isRunning))
      })
    },
    setRunning: (nextRunning: boolean) => {
      isRunning = nextRunning
      activeTweens.forEach((tween) => {
        if (nextRunning) {
          tween.play()
        } else {
          tween.pause()
        }
      })
    },
    stop: () => {
      activeTweens.forEach((tween) => {
        tween.kill()
      })
      activeTweens.clear()
      visualGroups.forEach((visualGroup) => {
        visualGroup.position.set(0, 0)
      })
    },
  }
}
