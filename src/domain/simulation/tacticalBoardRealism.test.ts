/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations.ts'
import { SCENARIOS } from '../../data/scenarios.ts'
import { buildScenarioPlan } from './scenarioPlan.ts'
import { getWorldSnapshotAtProgress } from './worldSnapshot.ts'

// Player heads render at a 1.4 m pitch radius. Keeping centres at least one
// full token diameter apart prevents visual stacking at every board size.
const MINIMUM_VISIBLE_SEPARATION_METRES = 2.8

function buildCurrentPlan(scenario: (typeof SCENARIOS)[number]) {
  return buildScenarioPlan(
    scenario,
    FORMATION_POSITIONS[scenario.formationMode],
    OPPOSITION_POSITIONS[scenario.formationMode],
  )
}

test('every tactical-board scenario contains coordinated overlapping actions', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildCurrentPlan(scenario)
    let maximumActiveIntents = 0

    for (let sample = 0; sample <= 300; sample += 1) {
      const snapshot = getWorldSnapshotAtProgress(plan, sample / 300)
      const activeCount = snapshot.animationIntents.filter(
        (intent) => intent.playbackState === 'active',
      ).length

      maximumActiveIntents = Math.max(maximumActiveIntents, activeCount)
    }

    assert.ok(
      maximumActiveIntents >= 2,
      `${scenario.id} should show at least two coordinated actions at once`,
    )
  })
})

test('players remain visually separated throughout every scenario', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildCurrentPlan(scenario)

    for (let sample = 0; sample <= 400; sample += 1) {
      const progress = sample / 400
      const players = getWorldSnapshotAtProgress(plan, progress).players

      for (let firstIndex = 0; firstIndex < players.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < players.length; secondIndex += 1) {
          const first = players[firstIndex]
          const second = players[secondIndex]
          const distance = Math.hypot(
            first.position.x - second.position.x,
            first.position.y - second.position.y,
          )

          assert.ok(
            distance >= MINIMUM_VISIBLE_SEPARATION_METRES,
            `${scenario.id} overlaps ${first.side} #${first.number} and ${second.side} #${second.number} ` +
              `at ${(progress * 100).toFixed(1)}% (${distance.toFixed(2)}m)`,
          )
        }
      }
    }
  })
})

test('build-through-wide-channels has a home receiver at the end of every pass', () => {
  const scenario = SCENARIOS.find((item) => item.id === 'build-through-wide-channels')

  assert.ok(scenario)
  const plan = buildCurrentPlan(scenario)
  const passes = plan.animationIntents.filter(
    (intent) => intent.type === 'ball-movement' && intent.arrowType !== 'shot',
  )

  passes.forEach((intent) => {
    const players = getWorldSnapshotAtProgress(plan, intent.timing.endProgress).players
    const receiver = players
      .filter((player) => player.side === 'home')
      .map((player) => ({
        player,
        distance: Math.hypot(
          player.position.x - intent.to.x,
          player.position.y - intent.to.y,
        ),
      }))
      .sort((first, second) => first.distance - second.distance)[0]

    assert.ok(receiver, `${intent.arrowId} needs a receiving player`)
    assert.ok(
      receiver.distance <= 0.25,
      `${intent.arrowId} arrives ${receiver.distance.toFixed(2)}m from home #${receiver.player.number}`,
    )
  })
})

test('phase timing is monotonic and every phase authors body orientation', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildCurrentPlan(scenario)

    plan.phaseSteps.forEach((phaseStep, index) => {
      assert.ok(
        phaseStep.playerOrientations.length > 0,
        `${scenario.id}/${phaseStep.id} needs authored player orientation`,
      )
      assert.ok(phaseStep.timing.startProgress >= 0 && phaseStep.timing.startProgress <= 1)
      assert.ok(phaseStep.timing.endProgress >= phaseStep.timing.startProgress)

      if (index > 0) {
        assert.ok(
          phaseStep.timing.startProgress > plan.phaseSteps[index - 1].timing.startProgress,
          `${scenario.id} phase starts must advance through the real action timeline`,
        )
      }
    })
  })
})
