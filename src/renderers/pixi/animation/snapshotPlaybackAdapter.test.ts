/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { FORMATION_POSITIONS } from '../../../data/formations.ts'
import { SCENARIOS } from '../../../data/scenarios.ts'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms.ts'
import { compareSnapshotToLivePositions } from '../../../domain/simulation/snapshotComparisonLogger.ts'
import { buildScenarioPlan, type FormationPositions } from '../../../domain/simulation/scenarioPlan.ts'
import type { ScenarioPlan, TeamSide } from '../../../domain/simulation/worldTypes.ts'
import { getWorldSnapshotAtProgress } from '../../../domain/simulation/worldSnapshot.ts'
import { getBallPlaybackTween, getPlayerPlaybackTween, getRotationFromPitchVector } from './snapshotPlaybackAdapter.ts'
import type { ScenarioDefinition } from '../../../domain/scenarios/scenarioTypes.ts'

const SAMPLE_PROGRESS_VALUES = [0, 0.25, 0.5, 0.75, 1]
// The adapter derives ease from arrowType (shot vs everything else), mirroring
// scenarioAnimator.ts - there is no domain-level easeHint to enumerate against.
const KNOWN_EASE_VALUES = new Set<string>(['power1.inOut', 'power3.out'])
const KNOWN_PLAYER_EASE_VALUES = new Set<string>(['power2.inOut'])
const CANVAS_W = 1280
const CANVAS_H = 720
const PADDING = 40
const ENDPOINT_EPSILON = 1e-9

function buildPlanForScenario(scenario: ScenarioDefinition): ScenarioPlan {
  const formationPositions: FormationPositions = FORMATION_POSITIONS[scenario.formationMode]

  return buildScenarioPlan(scenario, formationPositions)
}

test('getBallPlaybackTween produces finite ball tween parameters for every sampled scenario progress', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    SAMPLE_PROGRESS_VALUES.forEach((progressTarget) => {
      const tween = getBallPlaybackTween(
        plan,
        0,
        progressTarget,
        CANVAS_W,
        CANVAS_H,
        PADDING,
      )
      const context = `scenario ${scenario.id} @ progress ${progressTarget}`

      assert.ok(tween, `${context}: expected ball playback tween`)
      assert.ok(
        Number.isFinite(tween.targetScreenPosition.sx),
        `${context}: targetScreenPosition.sx is not finite (${tween.targetScreenPosition.sx})`,
      )
      assert.ok(
        Number.isFinite(tween.targetScreenPosition.sy),
        `${context}: targetScreenPosition.sy is not finite (${tween.targetScreenPosition.sy})`,
      )
      assert.ok(
        Number.isFinite(tween.durationSeconds),
        `${context}: durationSeconds is not finite (${tween.durationSeconds})`,
      )
      assert.ok(tween.durationSeconds >= 0, `${context}: durationSeconds is negative`)
      assert.ok(KNOWN_EASE_VALUES.has(tween.ease), `${context}: unknown ease ${tween.ease}`)
    })
  })
})

test('getBallPlaybackTween returns undefined when a plan has no ball-movement intents', () => {
  const baseScenario = SCENARIOS[0]
  const plan = buildScenarioPlan(
    {
      ...structuredClone(baseScenario),
      arrows: (baseScenario.arrows ?? []).filter((arrow) => !['pass', 'dribble', 'shot'].includes(arrow.type)),
    },
    FORMATION_POSITIONS[baseScenario.formationMode],
  )

  assert.equal(
    getBallPlaybackTween(plan, 0, 0.5, CANVAS_W, CANVAS_H, PADDING),
    undefined,
  )
})

test('getPlayerPlaybackTween produces finite player tween parameters for every sampled scenario progress', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)
    const movingPlayers = new Map<string, { side: TeamSide; playerNumber: number }>()

    plan.animationIntents
      .filter((intent) => intent.type === 'player-movement' && intent.playerNumber !== undefined)
      .forEach((intent) => {
        movingPlayers.set(`${intent.side}-${intent.playerNumber}`, {
          side: intent.side,
          playerNumber: intent.playerNumber as number,
        })
      })

    movingPlayers.forEach(({ side, playerNumber }) => {
      SAMPLE_PROGRESS_VALUES.forEach((progressTarget) => {
        const tween = getPlayerPlaybackTween(
          plan,
          side,
          playerNumber,
          0,
          progressTarget,
          CANVAS_W,
          CANVAS_H,
          PADDING,
        )
        const context = `scenario ${scenario.id} player ${side}-${playerNumber} @ progress ${progressTarget}`

        assert.ok(tween, `${context}: expected player playback tween`)
        assert.ok(
          Number.isFinite(tween.targetScreenPosition.sx),
          `${context}: targetScreenPosition.sx is not finite (${tween.targetScreenPosition.sx})`,
        )
        assert.ok(
          Number.isFinite(tween.targetScreenPosition.sy),
          `${context}: targetScreenPosition.sy is not finite (${tween.targetScreenPosition.sy})`,
        )
        assert.ok(
          Number.isFinite(tween.durationSeconds),
          `${context}: durationSeconds is not finite (${tween.durationSeconds})`,
        )
        assert.ok(tween.durationSeconds >= 0, `${context}: durationSeconds is negative`)
        assert.ok(KNOWN_PLAYER_EASE_VALUES.has(tween.ease), `${context}: unknown ease ${tween.ease}`)
      })
    })
  })
})

test('snapshot playback adapter positions produce no unexplained comparison mismatches for every sampled real scenario', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    SAMPLE_PROGRESS_VALUES.forEach((progress) => {
      const snapshot = getWorldSnapshotAtProgress(plan, progress)
      const ballTween = getBallPlaybackTween(plan, progress, progress, CANVAS_W, CANVAS_H, PADDING)
      const liveHomePlayerScreenPositions = new Map<number, { sx: number; sy: number }>()

      snapshot.players
        .filter((player) => player.side === 'home')
        .forEach((player) => {
          const playerTween = getPlayerPlaybackTween(
            plan,
            player.side,
            player.number,
            progress,
            progress,
            CANVAS_W,
            CANVAS_H,
            PADDING,
          )

          if (playerTween) {
            liveHomePlayerScreenPositions.set(player.number, playerTween.targetScreenPosition)
            return
          }

          liveHomePlayerScreenPositions.set(
            player.number,
            pitchToScreen(player.position.x, player.position.y, CANVAS_W, CANVAS_H, PADDING),
          )
        })

      const rows = compareSnapshotToLivePositions({
        plan,
        progress,
        canvasWidth: CANVAS_W,
        canvasHeight: CANVAS_H,
        canvasPadding: PADDING,
        liveHomePlayerScreenPositions,
        liveBallScreenPosition: ballTween?.targetScreenPosition,
      })
      const mismatches = rows.filter((row) => row.deltaPx >= ENDPOINT_EPSILON)

      assert.deepEqual(
        mismatches,
        [],
        `scenario ${scenario.id} @ progress ${progress}: expected adapter-fed comparison to match snapshot positions`,
      )
    })
  })
})

test('getRotationFromPitchVector returns undefined for a zero-length vector without producing NaN', () => {
  const point = { x: 12, y: 34 }

  assert.equal(getRotationFromPitchVector(point, point), undefined)
  assert.equal(getRotationFromPitchVector({ x: 0, y: 0 }, { x: 0, y: 0 }), undefined)
})

test('getRotationFromPitchVector matches the static facingAngle rotation convention from PlayerLayer.ts', () => {
  const SHAPER_FORWARD_ROTATION_OFFSET_DEGREES = -90
  const origin = { x: 0, y: 0 }

  const facingAngleRotation = (facingAngle: number) => (
    ((facingAngle + SHAPER_FORWARD_ROTATION_OFFSET_DEGREES) * Math.PI) / 180
  )

  // facingAngle 0 = "facing up the pitch" = increasing pitch y.
  assert.ok(
    Math.abs(
      (getRotationFromPitchVector(origin, { x: 0, y: 1 }) ?? NaN) - facingAngleRotation(0),
    ) < 1e-9,
  )
  // facingAngle 90 = facing along increasing pitch x, no y change.
  assert.ok(
    Math.abs(
      (getRotationFromPitchVector(origin, { x: 1, y: 0 }) ?? NaN) - facingAngleRotation(90),
    ) < 1e-9,
  )
  // facingAngle 180 = facing down the pitch = decreasing pitch y.
  assert.ok(
    Math.abs(
      (getRotationFromPitchVector(origin, { x: 0, y: -1 }) ?? NaN) - facingAngleRotation(180),
    ) < 1e-9,
  )
  // facingAngle -90 = facing along decreasing pitch x.
  assert.ok(
    Math.abs(
      (getRotationFromPitchVector(origin, { x: -1, y: 0 }) ?? NaN) - facingAngleRotation(-90),
    ) < 1e-9,
  )
})

test('getRotationFromPitchVector is finite for every direction and magnitude, never NaN', () => {
  const origin = { x: 0, y: 0 }
  const samplePoints = [
    { x: 5, y: 0 }, { x: -5, y: 0 }, { x: 0, y: 5 }, { x: 0, y: -5 },
    { x: 3, y: 4 }, { x: -3, y: -4 }, { x: 0.001, y: -0.001 }, { x: 1000, y: -1000 },
  ]

  samplePoints.forEach((point) => {
    const rotation = getRotationFromPitchVector(origin, point)

    assert.ok(Number.isFinite(rotation), `expected finite rotation for vector ${JSON.stringify(point)}, got ${rotation}`)
  })
})
