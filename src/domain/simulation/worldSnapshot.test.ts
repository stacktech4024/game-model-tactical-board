/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import type { ScenarioPlan } from './worldTypes.ts'
import { getWorldSnapshotAtProgress } from './worldSnapshot.ts'

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
          endProgress: 0.2,
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
          startProgress: 0.2,
          endProgress: 0.8,
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
          startProgress: 0.8,
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
