/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import type { ScenarioDefinition } from '../scenarios/scenarioTypes.ts'
import { buildScenarioPlan, type FormationPositions } from './scenarioPlan.ts'

function makeScenario(): ScenarioDefinition {
  return {
    id: 'phase-2-test',
    title: 'Phase 2 Test Scenario',
    moment: 'Attacking Organization',
    momentOfGame: 'Attacking Organization',
    formationMode: 'attacking-433',
    zoneFocus: 'Zone 3',
    fieldGeography: {
      zones: [3],
      channels: [2],
      description: 'Test geography',
    },
    system: {
      shape: '1-4-3-3',
      description: 'Test system',
    },
    strategy: 'Test strategy',
    tactics: ['Test tactic'],
    skillSet: ['Test skill'],
    description: 'Test description',
    coachingPoints: ['Test point'],
    ballStart: { x: 12, y: 24 },
    phaseSteps: [
      {
        id: 'first-step',
        label: 'First Step',
        coachingCue: 'Keep the first action clean.',
        keyPlayers: [6, 8],
        zoneFocus: [3],
        channelFocus: [2],
        relatedArrows: ['late-pass', 'shot'],
      },
    ],
    arrows: [
      {
        id: 'late-pass',
        type: 'pass',
        from: { x: 10, y: 20 },
        to: { x: 20, y: 30 },
        playerNumber: 6,
        order: 2,
        delay: 0.2,
      },
      {
        id: 'early-run',
        type: 'run',
        from: { x: 30, y: 40 },
        to: { x: 35, y: 45 },
        playerNumber: 8,
        order: 1,
      },
      {
        id: 'press',
        type: 'press',
        from: { x: 40, y: 50 },
        to: { x: 42, y: 52 },
        playerNumber: 10,
        order: 3,
      },
      {
        id: 'recovery',
        type: 'recovery',
        from: { x: 42, y: 52 },
        to: { x: 41, y: 49 },
        playerNumber: 10,
        order: 4,
      },
      {
        id: 'dribble',
        type: 'dribble',
        from: { x: 20, y: 30 },
        via: { x: 23, y: 34 },
        to: { x: 25, y: 36 },
        playerNumber: 7,
        order: 5,
      },
      {
        id: 'shot',
        type: 'shot',
        from: { x: 25, y: 36 },
        to: { x: 34, y: 106 },
        playerNumber: 9,
        order: 6,
      },
    ],
  }
}

test('buildScenarioPlan preserves scenario identity', () => {
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})

  assert.equal(plan.scenarioId, scenario.id)
  assert.equal(plan.title, scenario.title)
  assert.equal(plan.moment, scenario.moment)
})

test('buildScenarioPlan includes initial ball position from ballStart', () => {
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})

  assert.deepEqual(plan.initialBall, {
    id: 'ball',
    position: { x: 12, y: 24 },
  })
})

test('buildScenarioPlan includes initial home player positions from formation positions', () => {
  const formationPositions: FormationPositions = {
    8: { x: 40, y: 55 },
    6: { x: 32, y: 52 },
  }

  const plan = buildScenarioPlan(makeScenario(), formationPositions)

  assert.deepEqual(plan.initialPlayers, [
    {
      id: 'home-6',
      side: 'home',
      number: 6,
      position: { x: 32, y: 52 },
    },
    {
      id: 'home-8',
      side: 'home',
      number: 8,
      position: { x: 40, y: 55 },
    },
  ])
})

test('buildScenarioPlan sorts animation intents deterministically from scenario arrows', () => {
  const plan = buildScenarioPlan(makeScenario(), {})

  assert.deepEqual(
    plan.animationIntents.map((intent) => intent.arrowId),
    ['early-run', 'late-pass', 'press', 'recovery', 'dribble', 'shot'],
  )

  assert.deepEqual(
    plan.animationIntents.map((intent) => intent.sequenceIndex),
    [0, 1, 2, 3, 4, 5],
  )
})

test('buildScenarioPlan maps pass, dribble, and shot as ball-related intents', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const intentTypes = Object.fromEntries(
    plan.animationIntents.map((intent) => [intent.arrowType, intent.type]),
  )

  assert.equal(intentTypes.pass, 'ball-movement')
  assert.equal(intentTypes.dribble, 'ball-movement')
  assert.equal(intentTypes.shot, 'ball-movement')
})

test('buildScenarioPlan maps run, press, and recovery as player-related intents', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const intentTypes = Object.fromEntries(
    plan.animationIntents.map((intent) => [intent.arrowType, intent.type]),
  )

  assert.equal(intentTypes.run, 'player-movement')
  assert.equal(intentTypes.press, 'player-movement')
  assert.equal(intentTypes.recovery, 'player-movement')
})

test('buildScenarioPlan preserves phase step focus and key player metadata', () => {
  const plan = buildScenarioPlan(makeScenario(), {})

  assert.deepEqual(plan.phaseSteps, [
    {
      id: 'first-step',
      label: 'First Step',
      coachingCue: 'Keep the first action clean.',
      keyPlayers: [
        { side: 'home', number: 6 },
        { side: 'home', number: 8 },
      ],
      zoneFocus: [3],
      channelFocus: [2],
      relatedArrows: ['late-pass', 'shot'],
    },
  ])
})

test('buildScenarioPlan does not mutate the original scenario or formation object', () => {
  const scenario = makeScenario()
  const formationPositions: FormationPositions = {
    6: { x: 32, y: 52 },
  }
  const scenarioBefore = structuredClone(scenario)
  const formationBefore = structuredClone(formationPositions)

  const plan = buildScenarioPlan(scenario, formationPositions)
  plan.initialPlayers[0].position.x = 99
  plan.animationIntents[0].from.x = 99
  plan.phaseSteps[0].zoneFocus.push(4)

  assert.deepEqual(scenario, scenarioBefore)
  assert.deepEqual(formationPositions, formationBefore)
})
