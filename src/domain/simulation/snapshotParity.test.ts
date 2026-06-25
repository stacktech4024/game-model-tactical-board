/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import type { ScenarioDefinition } from '../scenarios/scenarioTypes.ts'
import { PITCH } from '../pitch/pitchConstants.ts'
import { SCENARIOS } from '../../data/scenarios.ts'
import { FORMATION_POSITIONS } from '../../data/formations.ts'
import { buildScenarioPlan, type FormationPositions } from './scenarioPlan.ts'
import { getWorldSnapshotAtProgress } from './worldSnapshot.ts'
import type { ScenarioPlan } from './worldTypes.ts'

const SAMPLE_PROGRESS_VALUES = [0, 0.25, 0.5, 0.75, 1]
// Current scenarios place shot/finish targets at y: 106, just past PITCH.LENGTH
// (105), to put the goal mouth visibly past the line. Bounds checks allow that.
const GOAL_LINE_SLACK = 2
const MIN_X = -GOAL_LINE_SLACK
const MAX_X = PITCH.WIDTH + GOAL_LINE_SLACK
const MIN_Y = -GOAL_LINE_SLACK
const MAX_Y = PITCH.LENGTH + GOAL_LINE_SLACK

function buildPlanForScenario(scenario: ScenarioDefinition): ScenarioPlan {
  const formationPositions: FormationPositions = FORMATION_POSITIONS[scenario.formationMode]

  return buildScenarioPlan(scenario, formationPositions)
}

function getTotalDurationFromPlan(plan: ScenarioPlan): number {
  return plan.animationIntents.at(-1)?.timing.endTime ?? 0
}

function assertFinitePoint(point: { x: number; y: number } | undefined, context: string): void {
  assert.ok(point, `${context}: expected a coordinate, got undefined`)
  assert.ok(Number.isFinite(point.x), `${context}: x is not finite (${point.x})`)
  assert.ok(Number.isFinite(point.y), `${context}: y is not finite (${point.y})`)
}

function assertWithinPitchBounds(point: { x: number; y: number }, context: string): void {
  assert.ok(
    point.x >= MIN_X && point.x <= MAX_X,
    `${context}: x=${point.x} is outside reasonable pitch bounds [${MIN_X}, ${MAX_X}]`,
  )
  assert.ok(
    point.y >= MIN_Y && point.y <= MAX_Y,
    `${context}: y=${point.y} is outside reasonable pitch bounds [${MIN_Y}, ${MAX_Y}]`,
  )
}

test('buildScenarioPlan builds a plan for every current scenario', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    assert.equal(plan.scenarioId, scenario.id, `scenario ${scenario.id}: plan identity mismatch`)
  })
})

test('getWorldSnapshotAtProgress produces a structurally complete snapshot at every sampled progress for every scenario', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    SAMPLE_PROGRESS_VALUES.forEach((progress) => {
      const snapshot = getWorldSnapshotAtProgress(plan, progress)
      const context = `scenario ${scenario.id} @ progress ${progress}`

      assert.equal(snapshot.scenarioId, scenario.id, `${context}: scenario identity`)
      assert.ok(snapshot.clock.progress >= 0 && snapshot.clock.progress <= 1, `${context}: clamped progress`)
      assert.ok(Number.isFinite(snapshot.clock.elapsedSeconds), `${context}: elapsedSeconds finite`)

      if (plan.initialBall) {
        assert.ok(snapshot.ball, `${context}: expected ball state`)
      }

      assert.ok(snapshot.players.length > 0, `${context}: expected player states`)
      assert.ok(snapshot.focus, `${context}: expected focus metadata`)
      assert.ok(Array.isArray(snapshot.focus.keyPlayers), `${context}: focus.keyPlayers is an array`)
      assert.ok(Array.isArray(snapshot.focus.zoneFocus), `${context}: focus.zoneFocus is an array`)
      assert.ok(Array.isArray(snapshot.focus.channelFocus), `${context}: focus.channelFocus is an array`)
      assert.ok(Array.isArray(snapshot.focus.relatedArrows), `${context}: focus.relatedArrows is an array`)
      assert.ok(Array.isArray(snapshot.animationIntents), `${context}: animationIntents is an array`)

      if (plan.phaseSteps.length > 0) {
        assert.ok(snapshot.activePhaseStep, `${context}: expected an active phase step`)
      }
    })
  })
})

test('every scheduled animation intent has timing bounded within [0, 1] and startProgress <= endProgress', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    plan.animationIntents.forEach((intent) => {
      const context = `scenario ${scenario.id} intent ${intent.arrowId}`

      assert.ok(
        intent.timing.startProgress >= 0 && intent.timing.startProgress <= 1,
        `${context}: startProgress out of range (${intent.timing.startProgress})`,
      )
      assert.ok(
        intent.timing.endProgress >= 0 && intent.timing.endProgress <= 1,
        `${context}: endProgress out of range (${intent.timing.endProgress})`,
      )
      assert.ok(
        intent.timing.startProgress <= intent.timing.endProgress,
        `${context}: startProgress (${intent.timing.startProgress}) > endProgress (${intent.timing.endProgress})`,
      )
    })
  })
})

test('animation intents are ordered by schedule for every scenario', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    plan.animationIntents.forEach((intent, index) => {
      assert.equal(
        intent.sequenceIndex,
        index,
        `scenario ${scenario.id}: intent ${intent.arrowId} sequenceIndex out of order`,
      )

      const previousIntent = plan.animationIntents[index - 1]

      if (!previousIntent) {
        return
      }

      assert.ok(
        intent.timing.startTime >= previousIntent.timing.startTime,
        `scenario ${scenario.id}: intent ${intent.arrowId} starts before previous intent ${previousIntent.arrowId}`,
      )
      assert.ok(
        intent.timing.startProgress >= previousIntent.timing.startProgress,
        `scenario ${scenario.id}: intent ${intent.arrowId} startProgress regresses relative to previous intent`,
      )
    })
  })
})

test('the final scheduled intent ends at progress 1 when intents exist', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)
    const lastIntent = plan.animationIntents.at(-1)

    if (!lastIntent) {
      return
    }

    assert.equal(
      lastIntent.timing.endProgress,
      1,
      `scenario ${scenario.id}: final intent ${lastIntent.arrowId} does not end at progress 1`,
    )
  })
})

test('zero-intent scenarios do not crash when building a plan or sampling snapshots', () => {
  const baseScenario = SCENARIOS[0]
  const zeroIntentScenario: ScenarioDefinition = {
    ...structuredClone(baseScenario),
    arrows: [],
  }

  const plan = buildScenarioPlan(zeroIntentScenario, FORMATION_POSITIONS[zeroIntentScenario.formationMode])

  assert.deepEqual(plan.animationIntents, [])

  SAMPLE_PROGRESS_VALUES.forEach((progress) => {
    assert.doesNotThrow(() => {
      const snapshot = getWorldSnapshotAtProgress(plan, progress)

      assert.deepEqual(snapshot.animationIntents, [])
      assert.equal(snapshot.clock.elapsedSeconds, 0)
    })
  })
})

test('clock.elapsedSeconds equals clampedProgress * totalDuration for every scenario at every sampled progress', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)
    const totalDuration = getTotalDurationFromPlan(plan)

    SAMPLE_PROGRESS_VALUES.forEach((progress) => {
      const snapshot = getWorldSnapshotAtProgress(plan, progress)
      const clampedProgress = Math.min(1, Math.max(0, progress))
      const expectedElapsedSeconds = clampedProgress * totalDuration

      assert.ok(
        Math.abs(snapshot.clock.elapsedSeconds - expectedElapsedSeconds) < 1e-9,
        `scenario ${scenario.id} @ progress ${progress}: elapsedSeconds=${snapshot.clock.elapsedSeconds}, expected ${expectedElapsedSeconds}`,
      )
    })
  })
})

test('ball and player pitch coordinates remain finite and within reasonable bounds for every scenario at every sampled progress', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    SAMPLE_PROGRESS_VALUES.forEach((progress) => {
      const snapshot = getWorldSnapshotAtProgress(plan, progress)
      const context = `scenario ${scenario.id} @ progress ${progress}`

      if (snapshot.ball) {
        assertFinitePoint(snapshot.ball.position, `${context}: ball`)
        assertWithinPitchBounds(snapshot.ball.position, `${context}: ball`)
      }

      snapshot.players.forEach((player) => {
        const playerContext = `${context}: player ${player.side}-${player.number}`

        assertFinitePoint(player.position, playerContext)
        assertWithinPitchBounds(player.position, playerContext)
      })
    })
  })
})

test('completed intents apply final positions in schedule order at progress 1', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)
    const snapshot = getWorldSnapshotAtProgress(plan, 1)

    const lastBallIntent = plan.animationIntents
      .filter((intent) => intent.type === 'ball-movement')
      .at(-1)

    if (lastBallIntent && snapshot.ball) {
      assert.deepEqual(
        snapshot.ball.position,
        lastBallIntent.to,
        `scenario ${scenario.id}: ball does not end at the last ball intent's target`,
      )
    }

    const lastIntentByPlayer = new Map<string, typeof plan.animationIntents[number]>()

    plan.animationIntents
      .filter((intent) => intent.type === 'player-movement' && intent.playerNumber !== undefined)
      .forEach((intent) => {
        lastIntentByPlayer.set(`${intent.side}-${intent.playerNumber}`, intent)
      })

    lastIntentByPlayer.forEach((intent, key) => {
      const player = snapshot.players.find(
        (item) => `${item.side}-${item.number}` === key,
      )

      if (!player) {
        return
      }

      assert.deepEqual(
        player.position,
        intent.to,
        `scenario ${scenario.id}: player ${key} does not end at its last scheduled target`,
      )
    })
  })
})

test('pending intents do not move entities early at progress 0', () => {
  // An intent scheduled to start exactly at progress 0 is "active", not
  // "pending" (see getIntentPlaybackState), and is allowed to immediately
  // reflect its arrow's `from` coordinate even if that differs from the
  // formation-derived initial position (e.g. set-piece scenarios position
  // a player at the corner flag, not their open-play formation slot). This
  // test only asserts the invariant for intents that have NOT started yet.
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)
    const snapshot = getWorldSnapshotAtProgress(plan, 0)

    const ballHasImmediateIntent = plan.animationIntents.some(
      (intent) => intent.type === 'ball-movement' && intent.timing.startProgress <= 0,
    )

    if (plan.initialBall && snapshot.ball && !ballHasImmediateIntent) {
      assert.deepEqual(
        snapshot.ball.position,
        plan.initialBall.position,
        `scenario ${scenario.id}: ball moved before progress 0 despite no intent starting at progress 0`,
      )
    }

    plan.initialPlayers.forEach((initialPlayer) => {
      const player = snapshot.players.find(
        (item) => item.side === initialPlayer.side && item.number === initialPlayer.number,
      )

      assert.ok(player, `scenario ${scenario.id}: missing player ${initialPlayer.side}-${initialPlayer.number}`)

      const hasImmediateIntent = plan.animationIntents.some(
        (intent) =>
          intent.type === 'player-movement' &&
          intent.side === initialPlayer.side &&
          intent.playerNumber === initialPlayer.number &&
          intent.timing.startProgress <= 0,
      )

      if (hasImmediateIntent) {
        return
      }

      assert.deepEqual(
        player.position,
        initialPlayer.position,
        `scenario ${scenario.id}: player ${initialPlayer.side}-${initialPlayer.number} moved before progress 0 ` +
          'despite no intent starting at progress 0',
      )
    })
  })
})

test('player tokens with an intent starting at progress 0 immediately reflect that intent\'s "from" coordinate', () => {
  // Companion to the previous test: documents and locks in the current data
  // characteristic where a same-time-zero arrow's `from` point can diverge
  // from the formation-derived initial position (set-piece pre-positioning).
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)
    const snapshot = getWorldSnapshotAtProgress(plan, 0)

    plan.animationIntents
      .filter(
        (intent) => intent.type === 'player-movement' && intent.timing.startProgress <= 0,
      )
      .forEach((intent) => {
        const player = snapshot.players.find(
          (item) => item.side === intent.side && item.number === intent.playerNumber,
        )

        if (!player) {
          return
        }

        assert.deepEqual(
          player.position,
          intent.from,
          `scenario ${scenario.id}: player ${intent.side}-${intent.playerNumber} with an immediate intent ` +
            "should reflect that intent's from-coordinate at progress 0",
        )
      })
  })
})

test('every player-movement intent resolves against the available home players for every scenario', () => {
  const gaps: string[] = []

  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)
    const availablePlayerKeys = new Set(
      plan.initialPlayers.map((player) => `${player.side}-${player.number}`),
    )

    plan.animationIntents
      .filter((intent) => intent.type === 'player-movement')
      .forEach((intent) => {
        if (intent.playerNumber === undefined) {
          return
        }

        const key = `${intent.side}-${intent.playerNumber}`

        if (!availablePlayerKeys.has(key)) {
          gaps.push(
            `scenario ${scenario.id}: intent ${intent.arrowId} references ${key}, ` +
              'which has no resolvable initial player (no formation position for this side/number)',
          )
        }
      })
  })

  assert.deepEqual(gaps, [], `Found player-movement compatibility gaps:\n${gaps.join('\n')}`)
})

test('every ball-movement intent has usable finite from/to coordinates for every scenario', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    plan.animationIntents
      .filter((intent) => intent.type === 'ball-movement')
      .forEach((intent) => {
        const context = `scenario ${scenario.id} intent ${intent.arrowId}`

        assertFinitePoint(intent.from, `${context}: from`)
        assertFinitePoint(intent.to, `${context}: to`)
      })
  })
})

test('every via coordinate is finite when present for every scenario', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    plan.animationIntents.forEach((intent) => {
      if (!intent.via) {
        return
      }

      assertFinitePoint(intent.via, `scenario ${scenario.id} intent ${intent.arrowId}: via`)
    })
  })
})

// Module specifiers that the simulation domain layer and this parity test
// must never import. Checked against actual `import ... from '...'`
// specifiers (not raw substrings) so this list can name its own targets
// without the check tripping over its own source.
const FORBIDDEN_IMPORT_TERMS = [
  'pixi.js',
  'gsap',
  'react',
  'xstate',
  'zustand',
  'pixicanvas',
  'scenarioanimator',
  'timelinescrubber',
]

function getImportSpecifiers(source: string): string[] {
  const importRegex = /import\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/g
  const specifiers: string[] = []
  let match: RegExpExecArray | null

  while ((match = importRegex.exec(source)) !== null) {
    specifiers.push(match[1])
  }

  return specifiers
}

test('simulation domain and snapshot parity files do not import Pixi, GSAP, React, XState, Zustand, or the runtime renderer/controller modules', () => {
  const filesToCheck = [
    'src/domain/simulation/worldTypes.ts',
    'src/domain/simulation/scenarioPlan.ts',
    'src/domain/simulation/worldSnapshot.ts',
    'src/domain/simulation/snapshotParity.test.ts',
  ]

  filesToCheck.forEach((filePath) => {
    const specifiers = getImportSpecifiers(readFileSync(filePath, 'utf8'))

    specifiers.forEach((specifier) => {
      FORBIDDEN_IMPORT_TERMS.forEach((term) => {
        assert.equal(
          specifier.toLowerCase().includes(term),
          false,
          `${filePath}: import specifier "${specifier}" matches forbidden term "${term}"`,
        )
      })
    })
  })
})
