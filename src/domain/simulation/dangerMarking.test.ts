/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { getNearestCoverDefender } from './dangerMarking.ts'
import type { DangerArea } from './dangerMarking.ts'
import type { PlayerState, TeamSide, WorldSnapshot } from './worldTypes.ts'

const CENTRAL_DANGER_AREA: DangerArea = {
  id: 'central-front-of-goal',
  defendingSide: 'home',
  minX: 28,
  maxX: 40,
  minY: 78,
  maxY: 94,
}

function makePlayer(side: TeamSide, number: number, x: number, y: number): PlayerState {
  return {
    id: `${side}-${number}`,
    side,
    number,
    position: { x, y },
  }
}

function makeSnapshot(players: PlayerState[]): WorldSnapshot {
  return {
    scenarioId: 'danger-marking-test',
    title: 'Danger Marking Test',
    moment: 'Defensive Organization',
    clock: {
      elapsedSeconds: 0,
      progress: 0,
    },
    players,
    focus: {
      keyPlayers: [],
      zoneFocus: [],
      channelFocus: [],
      relatedArrows: [],
    },
    animationIntents: [],
  }
}

test('getNearestCoverDefender picks the same-side player closest to the danger area', () => {
  const snapshot = makeSnapshot([
    makePlayer('home', 4, 20, 82),
    makePlayer('home', 5, 42, 84),
    makePlayer('home', 6, 34, 62),
  ])

  const suggestion = getNearestCoverDefender(snapshot, CENTRAL_DANGER_AREA)

  assert.equal(suggestion?.defender.number, 5)
  assert.equal(suggestion?.distanceToArea, 2)
})

test('getNearestCoverDefender ignores opponents even when they are closer', () => {
  const snapshot = makeSnapshot([
    makePlayer('away', 9, 34, 86),
    makePlayer('home', 4, 26, 86),
    makePlayer('home', 5, 50, 88),
  ])

  const suggestion = getNearestCoverDefender(snapshot, CENTRAL_DANGER_AREA)

  assert.equal(suggestion?.defender.side, 'home')
  assert.equal(suggestion?.defender.number, 4)
})

test('getNearestCoverDefender prefers a defender already inside the danger area', () => {
  const snapshot = makeSnapshot([
    makePlayer('home', 4, 27, 86),
    makePlayer('home', 5, 38, 90),
    makePlayer('home', 6, 34, 72),
  ])

  const suggestion = getNearestCoverDefender(snapshot, CENTRAL_DANGER_AREA)

  assert.equal(suggestion?.defender.number, 5)
  assert.equal(suggestion?.distanceToArea, 0)
})

test('getNearestCoverDefender breaks equal-position ties by player number', () => {
  const snapshot = makeSnapshot([
    makePlayer('home', 5, 26, 86),
    makePlayer('home', 4, 42, 86),
  ])

  const suggestion = getNearestCoverDefender(snapshot, CENTRAL_DANGER_AREA)

  assert.equal(suggestion?.defender.number, 4)
})

test('getNearestCoverDefender normalizes reversed area bounds', () => {
  const snapshot = makeSnapshot([
    makePlayer('home', 4, 42, 84),
    makePlayer('home', 5, 20, 84),
  ])
  const reversedArea: DangerArea = {
    id: 'reversed-central-front-of-goal',
    defendingSide: 'home',
    minX: CENTRAL_DANGER_AREA.maxX,
    maxX: CENTRAL_DANGER_AREA.minX,
    minY: CENTRAL_DANGER_AREA.maxY,
    maxY: CENTRAL_DANGER_AREA.minY,
  }

  const suggestion = getNearestCoverDefender(snapshot, reversedArea)

  assert.equal(suggestion?.defender.number, 4)
  assert.deepEqual(suggestion?.areaCenter, { x: 34, y: 86 })
})

test('getNearestCoverDefender returns null when the defending side has no players', () => {
  const snapshot = makeSnapshot([
    makePlayer('away', 9, 34, 86),
  ])

  const suggestion = getNearestCoverDefender(snapshot, CENTRAL_DANGER_AREA)

  assert.equal(suggestion, null)
})
