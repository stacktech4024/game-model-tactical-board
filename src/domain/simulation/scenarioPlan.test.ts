/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import type { ScenarioDefinition } from '../scenarios/scenarioTypes.ts'
import { buildScenarioPlan, type FormationPositions } from './scenarioPlan.ts'

function round(value: number): number {
  return Number(value.toFixed(6))
}

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

function makeScenarioWithArrows(arrows: ScenarioDefinition['arrows']): ScenarioDefinition {
  return {
    ...makeScenario(),
    arrows,
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

test('buildScenarioPlan includes initial away player positions when away formation positions are provided', () => {
  const homeFormationPositions: FormationPositions = {
    6: { x: 32, y: 52 },
  }
  const awayFormationPositions: FormationPositions = {
    7: { x: 54, y: 56 },
    11: { x: 14, y: 56 },
  }

  const plan = buildScenarioPlan(makeScenario(), homeFormationPositions, awayFormationPositions)

  assert.deepEqual(plan.initialPlayers, [
    {
      id: 'home-6',
      side: 'home',
      number: 6,
      position: { x: 32, y: 52 },
    },
    {
      id: 'away-7',
      side: 'away',
      number: 7,
      position: { x: 54, y: 56 },
    },
    {
      id: 'away-11',
      side: 'away',
      number: 11,
      position: { x: 14, y: 56 },
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

test('buildScenarioPlan assigns deterministic timing windows to intents', () => {
  const plan = buildScenarioPlan(makeScenario(), {})

  assert.deepEqual(
    plan.animationIntents.map((intent) => ({
      arrowId: intent.arrowId,
      startTime: round(intent.timing.startTime),
      endTime: round(intent.timing.endTime),
      duration: round(intent.timing.duration),
    })),
    [
      { arrowId: 'early-run', startTime: 0, endTime: 1.15, duration: 1.15 },
      { arrowId: 'late-pass', startTime: 1.35, endTime: 2.05, duration: 0.7 },
      { arrowId: 'press', startTime: 2.05, endTime: 3.2, duration: 1.15 },
      { arrowId: 'recovery', startTime: 3.2, endTime: 4.35, duration: 1.15 },
      { arrowId: 'dribble', startTime: 4.35, endTime: 5.21, duration: 0.86 },
      { arrowId: 'shot', startTime: 5.21, endTime: 5.61, duration: 0.4 },
    ],
  )
})

test('buildScenarioPlan timing windows cover normalized progress from 0 to 1', () => {
  const plan = buildScenarioPlan(makeScenario(), {})

  assert.equal(plan.animationIntents[0].timing.startProgress, 0)
  assert.equal(plan.animationIntents.at(-1)?.timing.endProgress, 1)
})

test('buildScenarioPlan timing windows follow sorted intent order', () => {
  const plan = buildScenarioPlan(makeScenario(), {})

  assert.deepEqual(
    plan.animationIntents.map((intent) => ({
      arrowId: intent.arrowId,
      startProgress: round(intent.timing.startProgress),
      endProgress: round(intent.timing.endProgress),
    })),
    [
      { arrowId: 'early-run', startProgress: 0, endProgress: round(1.15 / 5.61) },
      { arrowId: 'late-pass', startProgress: round(1.35 / 5.61), endProgress: round(2.05 / 5.61) },
      { arrowId: 'press', startProgress: round(2.05 / 5.61), endProgress: round(3.2 / 5.61) },
      { arrowId: 'recovery', startProgress: round(3.2 / 5.61), endProgress: round(4.35 / 5.61) },
      { arrowId: 'dribble', startProgress: round(4.35 / 5.61), endProgress: round(5.21 / 5.61) },
      { arrowId: 'shot', startProgress: round(5.21 / 5.61), endProgress: 1 },
    ],
  )
})

test('buildScenarioPlan places missing arrow order after explicit orders', () => {
  const scenario = makeScenarioWithArrows([
    {
      id: 'missing-order',
      type: 'pass',
      from: { x: 10, y: 20 },
      to: { x: 20, y: 30 },
    },
    {
      id: 'explicit-order',
      type: 'run',
      from: { x: 30, y: 40 },
      to: { x: 35, y: 45 },
      playerNumber: 8,
      order: 1,
    },
  ])
  const plan = buildScenarioPlan(scenario, {})

  assert.deepEqual(
    plan.animationIntents.map((intent) => intent.arrowId),
    ['explicit-order', 'missing-order'],
  )
})

test('buildScenarioPlan preserves original array order for equal explicit orders', () => {
  const scenario = makeScenarioWithArrows([
    {
      id: 'first',
      type: 'pass',
      from: { x: 10, y: 20 },
      to: { x: 20, y: 30 },
      order: 1,
    },
    {
      id: 'second',
      type: 'run',
      from: { x: 30, y: 40 },
      to: { x: 35, y: 45 },
      playerNumber: 8,
      order: 1,
    },
  ])
  const plan = buildScenarioPlan(scenario, {})

  assert.deepEqual(
    plan.animationIntents.map((intent) => intent.arrowId),
    ['first', 'second'],
  )
})

test('buildScenarioPlan assigns pass and dribble intents 0.7 duration', () => {
  const scenario = makeScenarioWithArrows([
    {
      id: 'pass',
      type: 'pass',
      from: { x: 10, y: 20 },
      to: { x: 20, y: 30 },
      order: 1,
    },
    {
      id: 'dribble',
      type: 'dribble',
      from: { x: 20, y: 30 },
      to: { x: 25, y: 36 },
      playerNumber: 7,
      order: 2,
    },
  ])
  const plan = buildScenarioPlan(scenario, {})
  const durationsByArrow = Object.fromEntries(
    plan.animationIntents.map((intent) => [intent.arrowId, round(intent.timing.duration)]),
  )

  assert.equal(durationsByArrow.pass, 0.7)
  assert.equal(durationsByArrow.dribble, 0.7)
})

test('buildScenarioPlan assigns shot intents 0.4 duration', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const shotIntent = plan.animationIntents.find((intent) => intent.arrowType === 'shot')

  assert.equal(round(shotIntent?.timing.duration ?? 0), 0.4)
})

test('buildScenarioPlan assigns run, press, and recovery intents 1.15 duration', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const durationsByArrowType = Object.fromEntries(
    plan.animationIntents.map((intent) => [intent.arrowType, round(intent.timing.duration)]),
  )

  assert.equal(durationsByArrowType.run, 1.15)
  assert.equal(durationsByArrowType.press, 1.15)
  assert.equal(durationsByArrowType.recovery, 1.15)
})

test('buildScenarioPlan includes the 0.16 segment gap for via-point intents', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const dribbleIntent = plan.animationIntents.find((intent) => intent.arrowId === 'dribble')

  assert.equal(round(dribbleIntent?.timing.duration ?? 0), 0.86)
})

test('buildScenarioPlan shifts intent start time by delay relative to the accumulated timeline', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const delayedIntent = plan.animationIntents.find((intent) => intent.arrowId === 'late-pass')

  assert.equal(round(delayedIntent?.timing.startTime ?? 0), 1.35)
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

test('buildScenarioPlan assigns the power1.inOut ease hint to pass and dribble intents', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const easeHintsByArrowType = Object.fromEntries(
    plan.animationIntents.map((intent) => [intent.arrowType, intent.easeHint]),
  )

  assert.equal(easeHintsByArrowType.pass, 'power1.inOut')
  assert.equal(easeHintsByArrowType.dribble, 'power1.inOut')
})

test('buildScenarioPlan assigns the power3.out ease hint to shot intents', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const shotIntent = plan.animationIntents.find((intent) => intent.arrowType === 'shot')

  assert.equal(shotIntent?.easeHint, 'power3.out')
})

test('buildScenarioPlan assigns the power2.inOut ease hint to run, press, and recovery intents', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const easeHintsByArrowType = Object.fromEntries(
    plan.animationIntents.map((intent) => [intent.arrowType, intent.easeHint]),
  )

  assert.equal(easeHintsByArrowType.run, 'power2.inOut')
  assert.equal(easeHintsByArrowType.press, 'power2.inOut')
  assert.equal(easeHintsByArrowType.recovery, 'power2.inOut')
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
  plan.animationIntents[0].timing.startProgress = 99
  plan.phaseSteps[0].zoneFocus.push(4)

  assert.deepEqual(scenario, scenarioBefore)
  assert.deepEqual(formationPositions, formationBefore)
})
