/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { pitchToScreen } from '../pitch/coordTransforms.ts'
import {
  compareSnapshotToLivePositions,
  type LiveScreenPosition,
} from './snapshotComparisonLogger.ts'
import type { ScenarioPlan } from './worldTypes.ts'

const CANVAS_WIDTH = 700
const CANVAS_HEIGHT = 1050
const CANVAS_PADDING = 20

function makePlan(): ScenarioPlan {
  return {
    scenarioId: 'comparison-test',
    title: 'Comparison Test Scenario',
    moment: 'Attacking Transition',
    initialPlayers: [
      { id: 'home-6', side: 'home', number: 6, position: { x: 30, y: 50 } },
      { id: 'home-7', side: 'home', number: 7, position: { x: 34, y: 88 } },
      { id: 'home-8', side: 'home', number: 8, position: { x: 25, y: 60 } },
      { id: 'home-9', side: 'home', number: 9, position: { x: 34, y: 80 } },
      { id: 'home-11', side: 'home', number: 11, position: { x: 50, y: 70 } },
    ],
    initialBall: { id: 'ball', position: { x: 34, y: 50 } },
    animationIntents: [
      {
        id: 'intent-pass',
        arrowId: 'pass',
        type: 'ball-movement',
        arrowType: 'pass',
        side: 'home',
        from: { x: 34, y: 50 },
        to: { x: 34, y: 80 },
        order: 1,
        delay: 0,
        sequenceIndex: 0,
        easeHint: 'power1.inOut',
        timing: { startTime: 0, endTime: 1, duration: 1, startProgress: 0, endProgress: 0.5 },
      },
      {
        id: 'intent-run-pending',
        arrowId: 'run-6',
        type: 'player-movement',
        arrowType: 'run',
        side: 'home',
        playerNumber: 6,
        from: { x: 30, y: 50 },
        to: { x: 36, y: 60 },
        order: 2,
        delay: 0,
        sequenceIndex: 1,
        easeHint: 'power2.inOut',
        // Within the [0, 2] totalDuration window used by this fixture
        // (anchored by intent-run below, the last array entry), but pending
        // for every progress value the existing tests exercise (<= 0.75).
        timing: { startTime: 1.8, endTime: 1.9, duration: 0.1, startProgress: 0.9, endProgress: 0.95 },
      },
      {
        id: 'intent-run-completed',
        arrowId: 'run-8',
        type: 'player-movement',
        arrowType: 'run',
        side: 'home',
        playerNumber: 8,
        from: { x: 25, y: 60 },
        to: { x: 28, y: 65 },
        order: 2,
        delay: 0,
        sequenceIndex: 1,
        easeHint: 'power2.inOut',
        timing: { startTime: 0.05, endTime: 0.15, duration: 0.1, startProgress: 0.05, endProgress: 0.15 },
      },
      {
        id: 'intent-shot',
        arrowId: 'shot',
        type: 'ball-movement',
        arrowType: 'shot',
        side: 'home',
        playerNumber: 7,
        from: { x: 34, y: 76 },
        to: { x: 34, y: 100 },
        order: 3,
        delay: 0,
        sequenceIndex: 2,
        easeHint: 'power3.out',
        timing: { startTime: 0.6, endTime: 0.8, duration: 0.2, startProgress: 0.3, endProgress: 0.4 },
      },
      {
        id: 'intent-run',
        arrowId: 'run',
        type: 'player-movement',
        arrowType: 'run',
        side: 'home',
        playerNumber: 9,
        from: { x: 34, y: 80 },
        to: { x: 40, y: 90 },
        order: 4,
        delay: 0,
        sequenceIndex: 3,
        easeHint: 'power2.inOut',
        timing: { startTime: 1, endTime: 2, duration: 1, startProgress: 0.5, endProgress: 1 },
      },
    ],
    phaseSteps: [],
  }
}

function domainScreenPositionFor(x: number, y: number): LiveScreenPosition {
  const point = pitchToScreen(x, y, CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_PADDING)

  return { sx: point.sx, sy: point.sy }
}

function offsetBy(point: LiveScreenPosition, dx: number, dy: number): LiveScreenPosition {
  return { sx: point.sx + dx, sy: point.sy + dy }
}

test('compareSnapshotToLivePositions annotates eased-vs-linear divergence for a non-trivial delta during an active non-linear intent', () => {
  // progress 0.75 falls inside intent-run's window (0.5-1), whose easeHint is power2.inOut.
  const player9Domain = domainScreenPositionFor(34 + (40 - 34) * 0.5, 80 + (90 - 80) * 0.5)
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.75,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [9, offsetBy(player9Domain, 12, 0)],
      [6, domainScreenPositionFor(30, 50)],
    ]),
  })

  const player9Row = rows.find((row) => row.entityId === 'home-9')

  assert.ok(player9Row)
  assert.ok(player9Row.deltaPx >= 1)
  assert.equal(player9Row.note, 'eased-vs-linear divergence expected mid-tween')
})

test('compareSnapshotToLivePositions does not annotate eased divergence when the delta is trivial', () => {
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.75,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [9, domainScreenPositionFor(34 + (40 - 34) * 0.5, 80 + (90 - 80) * 0.5)],
    ]),
  })

  const player9Row = rows.find((row) => row.entityId === 'home-9')

  assert.ok(player9Row)
  assert.ok(player9Row.deltaPx < 1)
  assert.equal(player9Row.note, undefined)
})

test('compareSnapshotToLivePositions annotates an unexplained mismatch when no active non-linear intent explains a non-trivial delta', () => {
  // player 6 has a player-movement intent (pending, starts at progress 0.9),
  // so it is scripted - just not active here - and is not marked ambient.
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.1,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [6, offsetBy(domainScreenPositionFor(30, 50), 15, 0)],
    ]),
  })

  const player6Row = rows.find((row) => row.entityId === 'home-6')

  assert.ok(player6Row)
  assert.ok(player6Row.deltaPx >= 1)
  assert.equal(player6Row.note, 'unexplained mismatch')
})

test('compareSnapshotToLivePositions annotates no scripted player movement for a player with no player-movement intent anywhere in the plan', () => {
  // player 11 has no animation intents at all, scripted or otherwise.
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.5,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [11, offsetBy(domainScreenPositionFor(50, 70), 15, 0)],
    ]),
  })

  const player11Row = rows.find((row) => row.entityId === 'home-11')

  assert.ok(player11Row)
  assert.ok(player11Row.deltaPx >= 1)
  assert.equal(
    player11Row.note,
    'no scripted player movement for this entity — position reflects static formation slot',
  )
})

test('compareSnapshotToLivePositions does not annotate no-scripted-movement for a pending player-movement intent', () => {
  // player 6's intent starts at progress 0.9; at progress 0.1 it is pending,
  // not absent, so this must fall back to unexplained mismatch, not the
  // no-scripted-movement note.
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.1,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [6, offsetBy(domainScreenPositionFor(30, 50), 15, 0)],
    ]),
  })

  const player6Row = rows.find((row) => row.entityId === 'home-6')

  assert.ok(player6Row)
  assert.notEqual(
    player6Row.note,
    'no scripted player movement for this entity — position reflects static formation slot',
  )
  assert.equal(player6Row.note, 'unexplained mismatch')
})

test('compareSnapshotToLivePositions does not annotate no-scripted-movement for a completed player-movement intent', () => {
  // player 8's run intent window ends at progress 0.15; at progress 0.5 it
  // has completed, but it was still scripted, so this must not get the
  // no-scripted-movement note.
  const player8CompletedDomain = domainScreenPositionFor(28, 65)
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.5,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [8, offsetBy(player8CompletedDomain, 15, 0)],
    ]),
  })

  const player8Row = rows.find((row) => row.entityId === 'home-8')

  assert.ok(player8Row)
  assert.ok(player8Row.deltaPx >= 1)
  assert.notEqual(
    player8Row.note,
    'no scripted player movement for this entity — position reflects static formation slot',
  )
  assert.equal(player8Row.note, 'unexplained mismatch')
})

test('compareSnapshotToLivePositions does not treat a shot arrow\'s playerNumber as a player-movement intent', () => {
  // player 7 only appears as the playerNumber on a ball-movement shot arrow
  // (cosmetic scale pulse only, per scenarioAnimator) - it has no actual
  // player-movement intent, so it should still get the no-scripted-movement
  // note rather than being treated as scripted.
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.5,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [7, offsetBy(domainScreenPositionFor(34, 88), 15, 0)],
    ]),
  })

  const player7Row = rows.find((row) => row.entityId === 'home-7')

  assert.ok(player7Row)
  assert.ok(player7Row.deltaPx >= 1)
  assert.equal(
    player7Row.note,
    'no scripted player movement for this entity — position reflects static formation slot',
  )
})

test('compareSnapshotToLivePositions suppresses the no-scripted-movement note for an ambient player, same as it suppresses unexplained mismatch', () => {
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.5,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [11, offsetBy(domainScreenPositionFor(50, 70), 15, 0)],
    ]),
    ambientPlayerNumbers: new Set([11]),
  })

  const player11Row = rows.find((row) => row.entityId === 'home-11')

  assert.ok(player11Row)
  assert.equal(player11Row.note, 'ambient/idle drift expected for non-key player')
})

test('compareSnapshotToLivePositions reports the ambient/idle drift note unconditionally for ambient players, even with a zero delta', () => {
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.1,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [6, domainScreenPositionFor(30, 50)],
    ]),
    ambientPlayerNumbers: new Set([6]),
  })

  const player6Row = rows.find((row) => row.entityId === 'home-6')

  assert.ok(player6Row)
  assert.equal(player6Row.deltaPx, 0)
  assert.equal(player6Row.note, 'ambient/idle drift expected for non-key player')
})

test('compareSnapshotToLivePositions combines the ambient note and the eased-divergence note rather than replacing either', () => {
  const player9Domain = domainScreenPositionFor(34 + (40 - 34) * 0.5, 80 + (90 - 80) * 0.5)
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.75,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([
      [9, offsetBy(player9Domain, 12, 0)],
    ]),
    ambientPlayerNumbers: new Set([9]),
  })

  const player9Row = rows.find((row) => row.entityId === 'home-9')

  assert.ok(player9Row)
  assert.equal(
    player9Row.note,
    'ambient/idle drift expected for non-key player; eased-vs-linear divergence expected mid-tween',
  )
})

test('compareSnapshotToLivePositions annotates eased-vs-linear divergence for the ball during an active non-linear ball intent', () => {
  const ballDomain = domainScreenPositionFor(34, 50 + (80 - 50) * 0.25)
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.25,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map(),
    liveBallScreenPosition: offsetBy(ballDomain, 10, 0),
  })

  const ballRow = rows.find((row) => row.entityType === 'ball')

  assert.ok(ballRow)
  assert.ok(ballRow.deltaPx >= 1)
  assert.equal(ballRow.note, 'eased-vs-linear divergence expected mid-tween')
})

test('compareSnapshotToLivePositions never attaches the ambient note to the ball', () => {
  // progress 0.9 is past intent-pass's window (ends at 0.5), so the ball
  // sits at its completed target with no active intent - any non-trivial
  // delta here has no ease hint to explain it.
  const rows = compareSnapshotToLivePositions({
    plan: makePlan(),
    progress: 0.9,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map(),
    liveBallScreenPosition: offsetBy(domainScreenPositionFor(34, 80), 10, 0),
  })

  const ballRow = rows.find((row) => row.entityType === 'ball')

  assert.ok(ballRow)
  assert.equal(ballRow.note, 'unexplained mismatch')
})

test('compareSnapshotToLivePositions does not annotate eased divergence when the active intent\'s easeHint is explicitly linear', () => {
  const plan = makePlan()
  const runIntent = plan.animationIntents.find((intent) => intent.arrowId === 'run')

  assert.ok(runIntent)
  runIntent.easeHint = 'linear'

  const player9Domain = domainScreenPositionFor(34 + (40 - 34) * 0.5, 80 + (90 - 80) * 0.5)
  const rows = compareSnapshotToLivePositions({
    plan,
    progress: 0.75,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([[9, offsetBy(player9Domain, 12, 0)]]),
  })

  const player9Row = rows.find((row) => row.entityId === 'home-9')

  assert.ok(player9Row)
  assert.ok(player9Row.deltaPx >= 1)
  assert.equal(player9Row.note, 'unexplained mismatch')
})

test('compareSnapshotToLivePositions does not mutate the ScenarioPlan', () => {
  const plan = makePlan()
  const planBefore = structuredClone(plan)

  compareSnapshotToLivePositions({
    plan,
    progress: 0.75,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasPadding: CANVAS_PADDING,
    liveHomePlayerScreenPositions: new Map([[9, { sx: 0, sy: 0 }]]),
    liveBallScreenPosition: { sx: 0, sy: 0 },
  })

  assert.deepEqual(plan, planBefore)
})

function getImportSpecifiers(source: string): string[] {
  const importRegex = /import\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/g
  const specifiers: string[] = []
  let match: RegExpExecArray | null

  while ((match = importRegex.exec(source)) !== null) {
    specifiers.push(match[1])
  }

  return specifiers
}

test('snapshotComparisonLogger does not import Pixi, GSAP, React, XState, or Zustand', () => {
  const forbiddenTerms = ['pixi.js', 'gsap', 'react', 'xstate', 'zustand']
  const specifiers = getImportSpecifiers(
    readFileSync('src/domain/simulation/snapshotComparisonLogger.ts', 'utf8'),
  )

  specifiers.forEach((specifier) => {
    forbiddenTerms.forEach((term) => {
      assert.equal(
        specifier.toLowerCase().includes(term),
        false,
        `import specifier "${specifier}" matches forbidden term "${term}"`,
      )
    })
  })
})
