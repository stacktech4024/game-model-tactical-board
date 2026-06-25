/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import type { ScenarioPlan } from './worldTypes.ts'
import { getWorldSnapshotAtProgress } from './worldSnapshot.ts'

function round(value: number): number {
  return Number(value.toFixed(6))
}

function roundPoint(point: { x: number; y: number }): { x: number; y: number } {
  return {
    x: round(point.x),
    y: round(point.y),
  }
}

function getPlayerPosition(plan: ScenarioPlan, progress: number, playerNumber: number): { x: number; y: number } {
  const snapshot = getWorldSnapshotAtProgress(plan, progress)
  const player = snapshot.players.find((item) => item.number === playerNumber && item.side === 'home')

  assert.ok(player)

  return player.position
}

function makePlan(): ScenarioPlan {
  return {
    scenarioId: 'snapshot-test',
    title: 'Snapshot Test Scenario',
    moment: 'Defensive Organization',
    initialPlayers: [
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
    ],
    initialBall: {
      id: 'ball',
      position: { x: 12, y: 24 },
    },
    animationIntents: [
      {
        id: 'intent-pass',
        arrowId: 'pass',
        type: 'ball-movement',
        arrowType: 'pass',
        side: 'home',
        playerNumber: 6,
        from: { x: 12, y: 24 },
        to: { x: 20, y: 30 },
        order: 1,
        delay: 0,
        sequenceIndex: 0,
        timing: {
          startTime: 0,
          endTime: 0.7,
          duration: 0.7,
          startProgress: 0,
          endProgress: 0.7 / 2.25,
        },
        label: 'Pass',
      },
      {
        id: 'intent-run',
        arrowId: 'run',
        type: 'player-movement',
        arrowType: 'run',
        side: 'home',
        playerNumber: 8,
        from: { x: 40, y: 55 },
        to: { x: 48, y: 60 },
        order: 2,
        delay: 0,
        sequenceIndex: 1,
        timing: {
          startTime: 0.7,
          endTime: 1.85,
          duration: 1.15,
          startProgress: 0.7 / 2.25,
          endProgress: 1.85 / 2.25,
        },
        label: 'Run',
      },
      {
        id: 'intent-shot',
        arrowId: 'shot',
        type: 'ball-movement',
        arrowType: 'shot',
        side: 'home',
        playerNumber: 9,
        from: { x: 48, y: 60 },
        to: { x: 34, y: 106 },
        order: 3,
        delay: 0,
        sequenceIndex: 2,
        timing: {
          startTime: 1.85,
          endTime: 2.25,
          duration: 0.4,
          startProgress: 1.85 / 2.25,
          endProgress: 1,
        },
        label: 'Shot',
      },
    ],
    phaseSteps: [
      {
        id: 'first-step',
        label: 'First',
        coachingCue: 'Start organized.',
        keyPlayers: [{ side: 'home', number: 6 }],
        zoneFocus: [1],
        channelFocus: [1],
        relatedArrows: ['pass'],
      },
      {
        id: 'middle-step',
        label: 'Middle',
        coachingCue: 'Connect the next action.',
        keyPlayers: [{ side: 'home', number: 8 }],
        zoneFocus: [2, 3],
        channelFocus: [2],
        relatedArrows: [],
      },
      {
        id: 'final-step',
        label: 'Final',
        coachingCue: 'Finish the action.',
        keyPlayers: [
          { side: 'home', number: 6 },
          { side: 'home', number: 8 },
        ],
        zoneFocus: [4],
        channelFocus: [3],
        relatedArrows: ['pass'],
      },
    ],
  }
}

function makeViaPlan(): ScenarioPlan {
  return {
    ...makePlan(),
    initialBall: {
      id: 'ball',
      position: { x: 0, y: 0 },
    },
    animationIntents: [
      {
        id: 'intent-via-pass',
        arrowId: 'via-pass',
        type: 'ball-movement',
        arrowType: 'pass',
        side: 'home',
        from: { x: 0, y: 0 },
        via: { x: 10, y: 10 },
        to: { x: 20, y: 0 },
        order: 1,
        delay: 0,
        sequenceIndex: 0,
        timing: {
          startTime: 0,
          endTime: 0.86,
          duration: 0.86,
          startProgress: 0,
          endProgress: 1,
        },
      },
    ],
  }
}

function makeDelayPlan(): ScenarioPlan {
  return {
    ...makePlan(),
    initialBall: {
      id: 'ball',
      position: { x: 2, y: 2 },
    },
    animationIntents: [
      {
        id: 'intent-delayed-pass',
        arrowId: 'delayed-pass',
        type: 'ball-movement',
        arrowType: 'pass',
        side: 'home',
        from: { x: 10, y: 10 },
        to: { x: 20, y: 20 },
        order: 1,
        delay: 0.3,
        sequenceIndex: 0,
        timing: {
          startTime: 0.3,
          endTime: 1,
          duration: 0.7,
          startProgress: 0.3,
          endProgress: 1,
        },
      },
    ],
  }
}

function makeMultiBallPlan(): ScenarioPlan {
  return {
    ...makePlan(),
    initialBall: {
      id: 'ball',
      position: { x: 0, y: 0 },
    },
    animationIntents: [
      {
        id: 'intent-first-pass',
        arrowId: 'first-pass',
        type: 'ball-movement',
        arrowType: 'pass',
        side: 'home',
        from: { x: 0, y: 0 },
        to: { x: 10, y: 0 },
        order: 1,
        delay: 0,
        sequenceIndex: 0,
        timing: {
          startTime: 0,
          endTime: 1,
          duration: 1,
          startProgress: 0,
          endProgress: 1 / 3,
        },
      },
      {
        id: 'intent-second-pass',
        arrowId: 'second-pass',
        type: 'ball-movement',
        arrowType: 'pass',
        side: 'home',
        from: { x: 10, y: 0 },
        to: { x: 10, y: 10 },
        order: 2,
        delay: 0,
        sequenceIndex: 1,
        timing: {
          startTime: 1,
          endTime: 2,
          duration: 1,
          startProgress: 1 / 3,
          endProgress: 2 / 3,
        },
      },
      {
        id: 'intent-third-pass',
        arrowId: 'third-pass',
        type: 'ball-movement',
        arrowType: 'pass',
        side: 'home',
        from: { x: 10, y: 10 },
        to: { x: 20, y: 10 },
        order: 3,
        delay: 0,
        sequenceIndex: 2,
        timing: {
          startTime: 2,
          endTime: 3,
          duration: 1,
          startProgress: 2 / 3,
          endProgress: 1,
        },
      },
    ],
  }
}

function makePlanWithAnimationIntentCount(intentCount: number): ScenarioPlan {
  const plan = makePlan()

  if (intentCount === 1) {
    return {
      ...plan,
      animationIntents: [
        {
          ...plan.animationIntents[0],
          timing: {
            startTime: 0,
            endTime: 0.7,
            duration: 0.7,
            startProgress: 0,
            endProgress: 1,
          },
        },
      ],
    }
  }

  return {
    ...plan,
    animationIntents: plan.animationIntents.slice(0, intentCount),
  }
}

test('getWorldSnapshotAtProgress returns progress 0 snapshot with initial player positions', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0)

  assert.deepEqual(snapshot.players, [
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

test('getWorldSnapshotAtProgress returns progress 0 snapshot with initial ball position', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0)

  assert.deepEqual(snapshot.ball, {
    id: 'ball',
    position: { x: 12, y: 24 },
  })
})

test('getWorldSnapshotAtProgress clamps negative progress to 0', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), -0.5)

  assert.equal(snapshot.clock.progress, 0)
})

test('getWorldSnapshotAtProgress clamps progress greater than 1 to 1', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 1.5)

  assert.equal(snapshot.clock.progress, 1)
})

test('getWorldSnapshotAtProgress selects the first phase step at progress 0', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0)

  assert.equal(snapshot.activePhaseStep?.id, 'first-step')
})

test('getWorldSnapshotAtProgress selects the final phase step at progress 1', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 1)

  assert.equal(snapshot.activePhaseStep?.id, 'final-step')
})

test('getWorldSnapshotAtProgress selects a middle phase step at a middle progress value', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.5)

  assert.equal(snapshot.activePhaseStep?.id, 'middle-step')
})

test('getWorldSnapshotAtProgress preserves active key player metadata', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.5)

  assert.deepEqual(snapshot.focus.keyPlayers, [{ side: 'home', number: 8 }])
})

test('getWorldSnapshotAtProgress preserves zone and channel focus metadata', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.5)

  assert.deepEqual(snapshot.focus.zoneFocus, [2, 3])
  assert.deepEqual(snapshot.focus.channelFocus, [2])
})

test('getWorldSnapshotAtProgress does not mutate the ScenarioPlan', () => {
  const plan = makePlan()
  const planBefore = structuredClone(plan)
  const snapshot = getWorldSnapshotAtProgress(plan, 0.5)

  snapshot.players[0].position.x = 99
  snapshot.ball!.position.x = 99
  snapshot.activePhaseStep!.zoneFocus.push(4)
  snapshot.focus.keyPlayers[0].number = 99
  snapshot.animationIntents[0].from.x = 99
  snapshot.animationIntents[0].timing.startProgress = 99

  assert.deepEqual(plan, planBefore)
})

test('getWorldSnapshotAtProgress marks early intents as completed at later progress', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.5)

  assert.equal(snapshot.animationIntents[0].playbackState, 'completed')
})

test('getWorldSnapshotAtProgress marks the current intent as active', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.5)

  assert.equal(snapshot.animationIntents[1].playbackState, 'active')
})

test('getWorldSnapshotAtProgress marks future intents as pending', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.5)

  assert.equal(snapshot.animationIntents[2].playbackState, 'pending')
})

test('getWorldSnapshotAtProgress handles zero animation intents safely', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlanWithAnimationIntentCount(0), 0.5)

  assert.deepEqual(snapshot.animationIntents, [])
})

test('getWorldSnapshotAtProgress handles one animation intent safely', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlanWithAnimationIntentCount(1), 0.5)

  assert.equal(snapshot.animationIntents.length, 1)
  assert.equal(snapshot.animationIntents[0].playbackState, 'active')
})

test('getWorldSnapshotAtProgress clamps progress before calculating pending intent state', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), -0.5)

  assert.equal(snapshot.clock.progress, 0)
  assert.equal(snapshot.animationIntents[0].playbackState, 'active')
  assert.equal(snapshot.animationIntents[1].playbackState, 'pending')
})

test('getWorldSnapshotAtProgress clamps progress before calculating completed intent state', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 1.5)

  assert.equal(snapshot.clock.progress, 1)
  assert.equal(snapshot.animationIntents[2].playbackState, 'active')
})

test('getWorldSnapshotAtProgress places the ball at a completed pass target', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.32)

  assert.deepEqual(snapshot.ball?.position, { x: 20, y: 30 })
})

test('getWorldSnapshotAtProgress linearly interpolates an active ball pass', () => {
  const snapshot = getWorldSnapshotAtProgress(makePlan(), 0.35 / 2.25)

  assert.deepEqual(roundPoint(snapshot.ball!.position), { x: 16, y: 27 })
})

test('getWorldSnapshotAtProgress moves a via ball intent to the via point around halfway', () => {
  const snapshot = getWorldSnapshotAtProgress(makeViaPlan(), 0.35 / 0.86)

  assert.deepEqual(roundPoint(snapshot.ball!.position), { x: 10, y: 10 })
})

test('getWorldSnapshotAtProgress places a completed player run target on the referenced player', () => {
  const position = getPlayerPosition(makePlan(), 0.83, 8)

  assert.deepEqual(position, { x: 48, y: 60 })
})

test('getWorldSnapshotAtProgress interpolates only the referenced active player', () => {
  const plan = makePlan()
  const player8Position = getPlayerPosition(plan, 1.275 / 2.25, 8)
  const player6Position = getPlayerPosition(plan, 1.275 / 2.25, 6)

  assert.deepEqual(roundPoint(player8Position), { x: 44, y: 57.5 })
  assert.deepEqual(player6Position, { x: 32, y: 52 })
})

test('getWorldSnapshotAtProgress does not move a player for a pending intent', () => {
  const position = getPlayerPosition(makePlan(), 0.1, 8)

  assert.deepEqual(position, { x: 40, y: 55 })
})

test('getWorldSnapshotAtProgress applies multiple completed intents in schedule order', () => {
  const snapshot = getWorldSnapshotAtProgress(makeMultiBallPlan(), 2 / 3)

  assert.deepEqual(roundPoint(snapshot.ball!.position), { x: 10, y: 10 })
})

test('getWorldSnapshotAtProgress holds the previous ball position during delay before an intent starts', () => {
  const snapshot = getWorldSnapshotAtProgress(makeDelayPlan(), 0.1)

  assert.deepEqual(snapshot.ball?.position, { x: 2, y: 2 })
})

test('simulation domain files do not import Pixi, GSAP, or React', () => {
  const source = [
    readFileSync('src/domain/simulation/worldTypes.ts', 'utf8'),
    readFileSync('src/domain/simulation/scenarioPlan.ts', 'utf8'),
    readFileSync('src/domain/simulation/worldSnapshot.ts', 'utf8'),
  ].join('\n')

  assert.equal(source.includes('pixi.js'), false)
  assert.equal(source.includes('gsap'), false)
  assert.equal(source.includes('react'), false)
})
