/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { FORMATION_POSITIONS } from '../../../data/formations.ts'
import { SCENARIOS } from '../../../data/scenarios.ts'
import { buildScenarioPlan, type FormationPositions } from '../../../domain/simulation/scenarioPlan.ts'
import type { ScenarioPlan, TeamSide } from '../../../domain/simulation/worldTypes.ts'
import { getBallPlaybackTween, getPlayerPlaybackTween } from './snapshotPlaybackAdapter.ts'
import type { ScenarioDefinition } from '../../../domain/scenarios/scenarioTypes.ts'

const SAMPLE_PROGRESS_VALUES = [0, 0.25, 0.5, 0.75, 1]
// The adapter derives ease from arrowType (shot vs everything else), mirroring
// scenarioAnimator.ts - there is no domain-level easeHint to enumerate against.
const KNOWN_EASE_VALUES = new Set<string>(['power1.inOut', 'power3.out'])
const KNOWN_PLAYER_EASE_VALUES = new Set<string>(['power2.inOut'])
const CANVAS_W = 1280
const CANVAS_H = 720
const PADDING = 40

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
