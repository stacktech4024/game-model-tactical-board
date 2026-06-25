import { Container } from 'pixi.js'
import { gsap } from 'gsap'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { FormationPositionMap } from '../../../data/formations'
import type { HighlightZone } from '../../../domain/scenarios/scenarioTypes'

const MAX_SHIFT_METERS = 18
const METERS_PER_SECOND = 6
const MIN_DURATION_SECONDS = 0.8
const MAX_DURATION_SECONDS = 3
const MAX_START_DELAY_SECONDS = 0.5
const TARGET_EPSILON_METERS = 0.001

type PitchTarget = {
  x: number
  y: number
}

export type AmbientShapeShiftHandle = {
  update: (targetPlayerNumbers: Set<number>, zoneFocus: HighlightZone[] | undefined) => void
  setRunning: (running: boolean) => void
  stop: () => void
}

export type CreateAmbientShapeShiftArgs = {
  playerTokens: Map<number, Container>
  formationPositions: FormationPositionMap
  canvasW: number
  canvasH: number
  padding: number
  running: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getZoneCenterY(zoneNumber: HighlightZone): number {
  const zone = PITCH.ZONES[zoneNumber - 1]

  return (zone.startY + zone.endY) / 2
}

function getAverageZoneCenterY(zoneFocus: HighlightZone[] | undefined): number | undefined {
  if (!zoneFocus?.length) {
    return undefined
  }

  const totalY = zoneFocus.reduce((sum, zoneNumber) => sum + getZoneCenterY(zoneNumber), 0)

  return totalY / zoneFocus.length
}

function getTargetForAnchor(anchor: PitchTarget, zoneFocus: HighlightZone[] | undefined): PitchTarget {
  const zoneCenterY = getAverageZoneCenterY(zoneFocus)

  if (zoneCenterY === undefined) {
    return anchor
  }

  const deltaY = clamp(zoneCenterY - anchor.y, -MAX_SHIFT_METERS, MAX_SHIFT_METERS)

  return {
    x: anchor.x,
    y: anchor.y + deltaY,
  }
}

function targetsMatch(targetA: PitchTarget | undefined, targetB: PitchTarget): boolean {
  return Boolean(
    targetA &&
    Math.abs(targetA.x - targetB.x) < TARGET_EPSILON_METERS &&
    Math.abs(targetA.y - targetB.y) < TARGET_EPSILON_METERS,
  )
}

export function createAmbientShapeShift({
  playerTokens,
  formationPositions,
  canvasW,
  canvasH,
  padding,
  running,
}: CreateAmbientShapeShiftArgs): AmbientShapeShiftHandle {
  const activeTweens = new Map<number, gsap.core.Tween>()
  const lastTargets = new Map<number, PitchTarget>()
  let isRunning = running

  return {
    update: (targetPlayerNumbers: Set<number>, zoneFocus: HighlightZone[] | undefined) => {
      lastTargets.forEach((_, playerNumber) => {
        if (!targetPlayerNumbers.has(playerNumber)) {
          activeTweens.get(playerNumber)?.kill()
          activeTweens.delete(playerNumber)
          lastTargets.delete(playerNumber)
        }
      })

      targetPlayerNumbers.forEach((playerNumber) => {
        const token = playerTokens.get(playerNumber)
        const anchor = formationPositions[playerNumber]

        if (!token || !anchor) {
          return
        }

        const target = getTargetForAnchor(anchor, zoneFocus)

        if (targetsMatch(lastTargets.get(playerNumber), target)) {
          return
        }

        activeTweens.get(playerNumber)?.kill()
        lastTargets.set(playerNumber, target)

        const screenTarget = pitchToScreen(target.x, target.y, canvasW, canvasH, padding)
        const distanceMeters = Math.abs(target.y - anchor.y)
        const duration = clamp(
          distanceMeters / METERS_PER_SECOND,
          MIN_DURATION_SECONDS,
          MAX_DURATION_SECONDS,
        )

        activeTweens.set(
          playerNumber,
          gsap.to(token.position, {
            x: screenTarget.sx,
            y: screenTarget.sy,
            duration,
            delay: Math.random() * MAX_START_DELAY_SECONDS,
            ease: 'power2.out',
            paused: !isRunning,
            onComplete: () => {
              activeTweens.delete(playerNumber)
            },
          }),
        )
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
      lastTargets.clear()
    },
  }
}
