/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import type { ScenarioDefinition } from '../scenarios/scenarioTypes.ts'
import {
  buildScenarioPlan,
  getArrowMoveDuration,
  VIA_SEGMENT_GAP,
  PASS_SPEED_PROFILE,
  SHOT_SPEED_PROFILE,
  RUN_SPEED_PROFILE,
  PRESS_RECOVERY_SPEED_PROFILE,
  type FormationPositions,
} from './scenarioPlan.ts'

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
        releaseKind: 'player',
        releasedBy: { side: 'home', playerNumber: 6 },
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
        releaseKind: 'player',
        releasedBy: { side: 'home', playerNumber: 7 },
      },
      {
        id: 'shot',
        type: 'shot',
        from: { x: 25, y: 36 },
        to: { x: 34, y: 106 },
        playerNumber: 9,
        order: 6,
        releaseKind: 'player',
        releasedBy: { side: 'home', playerNumber: 9 },
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
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})
  const arrowsById = new Map((scenario.arrows ?? []).map((arrow) => [arrow.id, arrow]))
  const fullDurationFor = (arrowId: string): number => {
    const arrow = arrowsById.get(arrowId)

    assert.ok(arrow, `Expected fixture arrow ${arrowId}`)

    return getArrowMoveDuration(arrow) + (arrow.via ? VIA_SEGMENT_GAP : 0)
  }

  const earlyRunEnd = fullDurationFor('early-run')
  const latePassStart = earlyRunEnd + 0.2
  const latePassEnd = latePassStart + fullDurationFor('late-pass')
  const pressEnd = latePassEnd + fullDurationFor('press')
  const recoveryEnd = pressEnd + fullDurationFor('recovery')
  const dribbleEnd = recoveryEnd + fullDurationFor('dribble')
  const shotEnd = dribbleEnd + fullDurationFor('shot')

  assert.deepEqual(
    plan.animationIntents.map((intent) => ({
      arrowId: intent.arrowId,
      startTime: round(intent.timing.startTime),
      endTime: round(intent.timing.endTime),
      duration: round(intent.timing.duration),
    })),
    [
      { arrowId: 'early-run', startTime: 0, endTime: round(earlyRunEnd), duration: round(fullDurationFor('early-run')) },
      { arrowId: 'late-pass', startTime: round(latePassStart), endTime: round(latePassEnd), duration: round(fullDurationFor('late-pass')) },
      { arrowId: 'press', startTime: round(latePassEnd), endTime: round(pressEnd), duration: round(fullDurationFor('press')) },
      { arrowId: 'recovery', startTime: round(pressEnd), endTime: round(recoveryEnd), duration: round(fullDurationFor('recovery')) },
      { arrowId: 'dribble', startTime: round(recoveryEnd), endTime: round(dribbleEnd), duration: round(fullDurationFor('dribble')) },
      { arrowId: 'shot', startTime: round(dribbleEnd), endTime: round(shotEnd), duration: round(fullDurationFor('shot')) },
    ],
  )
})

test('buildScenarioPlan timing windows cover normalized progress from 0 to 1', () => {
  const plan = buildScenarioPlan(makeScenario(), {})

  assert.equal(plan.animationIntents[0].timing.startProgress, 0)
  assert.equal(plan.animationIntents.at(-1)?.timing.endProgress, 1)
})

test('buildScenarioPlan timing windows follow sorted intent order', () => {
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})
  const arrowsById = new Map((scenario.arrows ?? []).map((arrow) => [arrow.id, arrow]))
  const fullDurationFor = (arrowId: string): number => {
    const arrow = arrowsById.get(arrowId)

    assert.ok(arrow, `Expected fixture arrow ${arrowId}`)

    return getArrowMoveDuration(arrow) + (arrow.via ? VIA_SEGMENT_GAP : 0)
  }

  const earlyRunEnd = fullDurationFor('early-run')
  const latePassStart = earlyRunEnd + 0.2
  const latePassEnd = latePassStart + fullDurationFor('late-pass')
  const pressEnd = latePassEnd + fullDurationFor('press')
  const recoveryEnd = pressEnd + fullDurationFor('recovery')
  const dribbleEnd = recoveryEnd + fullDurationFor('dribble')
  const shotEnd = dribbleEnd + fullDurationFor('shot')
  const totalDuration = shotEnd

  assert.deepEqual(
    plan.animationIntents.map((intent) => ({
      arrowId: intent.arrowId,
      startProgress: round(intent.timing.startProgress),
      endProgress: round(intent.timing.endProgress),
    })),
    [
      { arrowId: 'early-run', startProgress: 0, endProgress: round(earlyRunEnd / totalDuration) },
      { arrowId: 'late-pass', startProgress: round(latePassStart / totalDuration), endProgress: round(latePassEnd / totalDuration) },
      { arrowId: 'press', startProgress: round(latePassEnd / totalDuration), endProgress: round(pressEnd / totalDuration) },
      { arrowId: 'recovery', startProgress: round(pressEnd / totalDuration), endProgress: round(recoveryEnd / totalDuration) },
      { arrowId: 'dribble', startProgress: round(recoveryEnd / totalDuration), endProgress: round(dribbleEnd / totalDuration) },
      { arrowId: 'shot', startProgress: round(dribbleEnd / totalDuration), endProgress: 1 },
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
      releaseKind: 'player',
      releasedBy: { side: 'home', playerNumber: 6 },
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
      releaseKind: 'player',
      releasedBy: { side: 'home', playerNumber: 6 },
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

test('buildScenarioPlan scales pass and dribble duration with distance, clamped to each speed profile', () => {
  const shortPass = {
    id: 'short-pass',
    type: 'pass' as const,
    from: { x: 10, y: 20 },
    to: { x: 11, y: 20 },
    order: 1,
    releaseKind: 'player' as const,
    releasedBy: { side: 'home' as const, playerNumber: 6 },
  }
  const longPass = {
    id: 'long-pass',
    type: 'pass' as const,
    from: { x: 0, y: 0 },
    to: { x: 0, y: 90 },
    order: 2,
    releaseKind: 'player' as const,
    releasedBy: { side: 'home' as const, playerNumber: 6 },
  }
  const dribble = {
    id: 'dribble',
    type: 'dribble' as const,
    from: { x: 20, y: 30 },
    to: { x: 25, y: 36 },
    playerNumber: 7,
    order: 3,
    releaseKind: 'player' as const,
    releasedBy: { side: 'home' as const, playerNumber: 7 },
  }
  const scenario = makeScenarioWithArrows([shortPass, longPass, dribble])
  const plan = buildScenarioPlan(scenario, {})
  const durationsByArrow = Object.fromEntries(
    plan.animationIntents.map((intent) => [intent.arrowId, round(intent.timing.duration)]),
  )

  // Short pass distance/speed falls under the min clamp.
  assert.equal(durationsByArrow['short-pass'], PASS_SPEED_PROFILE.minDurationSeconds)
  // Long pass distance/speed exceeds the max clamp.
  assert.equal(durationsByArrow['long-pass'], PASS_SPEED_PROFILE.maxDurationSeconds)
  // Dribble duration matches the dribble profile's distance/speed math directly.
  assert.equal(durationsByArrow.dribble, round(getArrowMoveDuration(dribble)))
  // A longer pass takes meaningfully longer than a short one - this is the
  // entire point of the fix, distance must affect duration.
  assert.ok(durationsByArrow['long-pass'] > durationsByArrow['short-pass'])
})

test('buildScenarioPlan clamps shot duration within the shot speed profile bounds', () => {
  const plan = buildScenarioPlan(makeScenario(), {})
  const shotIntent = plan.animationIntents.find((intent) => intent.arrowType === 'shot')

  assert.ok(shotIntent)
  assert.ok(shotIntent.timing.duration >= SHOT_SPEED_PROFILE.minDurationSeconds)
  assert.ok(shotIntent.timing.duration <= SHOT_SPEED_PROFILE.maxDurationSeconds)
})

test('buildScenarioPlan scales run duration with distance, clamped to the run speed profile', () => {
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})
  const arrowsById = new Map((scenario.arrows ?? []).map((arrow) => [arrow.id, arrow]))
  const intent = plan.animationIntents.find((item) => item.arrowId === 'early-run')
  const arrow = arrowsById.get('early-run')

  assert.ok(intent)
  assert.ok(arrow)
  assert.equal(round(intent.timing.duration), round(getArrowMoveDuration(arrow)))
  assert.ok(intent.timing.duration >= RUN_SPEED_PROFILE.minDurationSeconds)
  assert.ok(intent.timing.duration <= RUN_SPEED_PROFILE.maxDurationSeconds)
})

test('buildScenarioPlan scales press and recovery duration with distance, clamped to the press/recovery sprint profile', () => {
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})
  const arrowsById = new Map((scenario.arrows ?? []).map((arrow) => [arrow.id, arrow]))

  ;['press', 'recovery'].forEach((arrowId) => {
    const intent = plan.animationIntents.find((item) => item.arrowId === arrowId)
    const arrow = arrowsById.get(arrowId)

    assert.ok(intent, `Expected intent ${arrowId}`)
    assert.ok(arrow, `Expected fixture arrow ${arrowId}`)
    assert.equal(round(intent.timing.duration), round(getArrowMoveDuration(arrow)))
    assert.ok(intent.timing.duration >= PRESS_RECOVERY_SPEED_PROFILE.minDurationSeconds)
    assert.ok(intent.timing.duration <= PRESS_RECOVERY_SPEED_PROFILE.maxDurationSeconds)
  })
})

test('buildScenarioPlan gives press/recovery a faster speed than run, for the same distance', () => {
  const distance = 10
  const runArrow = {
    id: 'speed-tier-run',
    type: 'run' as const,
    from: { x: 0, y: 0 },
    to: { x: 0, y: distance },
    playerNumber: 4,
    order: 1,
  }
  const recoveryArrow = {
    id: 'speed-tier-recovery',
    type: 'recovery' as const,
    from: { x: 0, y: 0 },
    to: { x: 0, y: distance },
    playerNumber: 5,
    order: 1,
  }

  assert.ok(getArrowMoveDuration(recoveryArrow) < getArrowMoveDuration(runArrow))
})

test('buildScenarioPlan includes the 0.16 segment gap for via-point intents', () => {
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})
  const dribbleArrow = scenario.arrows?.find((arrow) => arrow.id === 'dribble')
  const dribbleIntent = plan.animationIntents.find((intent) => intent.arrowId === 'dribble')

  assert.ok(dribbleArrow)
  assert.ok(dribbleIntent)
  assert.equal(
    round(dribbleIntent.timing.duration),
    round(getArrowMoveDuration(dribbleArrow) + VIA_SEGMENT_GAP),
  )
})

test('buildScenarioPlan shifts intent start time by delay relative to the accumulated timeline', () => {
  const scenario = makeScenario()
  const plan = buildScenarioPlan(scenario, {})
  const earlyRunArrow = scenario.arrows?.find((arrow) => arrow.id === 'early-run')
  const delayedIntent = plan.animationIntents.find((intent) => intent.arrowId === 'late-pass')

  assert.ok(earlyRunArrow)
  assert.equal(
    round(delayedIntent?.timing.startTime ?? 0),
    round(getArrowMoveDuration(earlyRunArrow) + 0.2),
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
