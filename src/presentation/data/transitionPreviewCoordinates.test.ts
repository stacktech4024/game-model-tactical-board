/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { PITCH, getZoneNumberForY } from '../../domain/pitch/pitchConstants.ts'
import type { PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview.tsx'
import {
  ATTACKING_TRANSITION_PAGE_CASES,
  type AttackingTransitionPageCase,
} from './attackingTransitionPageData.ts'
import { DEFENSIVE_TRANSITION_PAGE_CASES } from './defensiveTransitionPageData.ts'
import {
  formationMetresToPitchPercentPositions,
  previewPointToPitchPercent,
} from './transitionPreviewCoordinates.ts'

type TransitionCase = AttackingTransitionPageCase

function getPlayer(testCase: TransitionCase, id: string) {
  const player = testCase.players.find((item) => item.id === id)

  assert.ok(player, `${testCase.id}: expected player ${id}`)

  return player
}

function getPitchPercentPositionsAtStepStart(
  testCase: TransitionCase,
  stepId: string,
): Map<string, { x: number; y: number }> {
  const positions = new Map(
    testCase.players.map((player) => [
      player.id,
      previewPointToPitchPercent(player),
    ]),
  )

  for (const step of testCase.steps) {
    if (step.id === stepId) {
      return positions
    }

    if (step.playerId && step.playerTo) {
      positions.set(step.playerId, previewPointToPitchPercent(step.playerTo))
    }

    step.playerMoves?.forEach((move) => {
      positions.set(move.playerId, previewPointToPitchPercent(move.to))
    })
  }

  assert.fail(`${testCase.id}: expected step ${stepId}`)
}

function assertAttackerOnsideAtStepStart(
  testCase: TransitionCase,
  stepId: string,
  attackerIds: string[],
): void {
  const positions = getPitchPercentPositionsAtStepStart(testCase, stepId)
  const awayY = [...positions.entries()]
    .filter(([id]) => id.startsWith('away-'))
    .map(([, point]) => point.y)
    .sort((a, b) => b - a)
  const secondLastOpponentY = awayY[1]

  assert.ok(Number.isFinite(secondLastOpponentY), `${testCase.id}: expected an offside line`)

  attackerIds.forEach((attackerId) => {
    const attacker = positions.get(attackerId)

    assert.ok(attacker, `${testCase.id}: expected ${attackerId} at ${stepId}`)
    assert.ok(
      attacker.y <= secondLastOpponentY,
      `${testCase.id} ${stepId}: ${attackerId} at ${attacker.y} is beyond the second-last opponent at ${secondLastOpponentY}`,
    )
  })
}

function assertVisibleTurnover(step: PixiPitchPreviewStep, initialBall: { x: number; y: number }, caseId: string): void {
  assert.ok(step.ballFrom, `${caseId}: turnover step needs ballFrom`)
  assert.ok(step.ballTo, `${caseId}: turnover step needs ballTo`)
  assert.deepEqual(step.ballFrom, initialBall, `${caseId}: turnover must begin at the visible initial ball`)
  assert.notDeepEqual(step.ballFrom, step.ballTo, `${caseId}: turnover must visibly move the ball`)
  assert.ok(step.playerId?.startsWith('away-'), `${caseId}: an opponent must collect the turnover`)
  assert.deepEqual(step.playerTo, step.ballTo, `${caseId}: opponent collection must finish at the loose ball`)
}

test('formation metres normalize to canonical pitch percentages before preview conversion', () => {
  const normalized = formationMetresToPitchPercentPositions({
    1: { x: PITCH.WIDTH / 2, y: 0 },
    2: { x: PITCH.WIDTH, y: PITCH.LENGTH },
  })

  assert.deepEqual(normalized[1], { x: 50, y: 0 })
  assert.deepEqual(normalized[2], { x: 100, y: 100 })
})

test('AT and DT previews keep home and away goalkeepers at the correct goal ends', () => {
  ;[...ATTACKING_TRANSITION_PAGE_CASES, ...DEFENSIVE_TRANSITION_PAGE_CASES].forEach((testCase) => {
    const homeGoalkeeper = getPlayer(testCase, 'home-1')
    const awayGoalkeeper = getPlayer(testCase, 'away-1')

    assert.ok(homeGoalkeeper.y > 75, `${testCase.id}: home GK must render at the bottom own goal`)
    assert.ok(awayGoalkeeper.y < 25, `${testCase.id}: away GK must render at the top opponent goal`)
    assert.equal(homeGoalkeeper.tone, 'keeper')
    assert.equal(awayGoalkeeper.tone, 'keeper')
    assert.equal(homeGoalkeeper.facingAngle, 0)
    assert.equal(awayGoalkeeper.facingAngle, 180)
  })
})

test('every AT and DT tab starts with the ball in its labelled canonical zone', () => {
  ;[...ATTACKING_TRANSITION_PAGE_CASES, ...DEFENSIVE_TRANSITION_PAGE_CASES].forEach((testCase) => {
    const expectedZone = Number(testCase.id.at(-1))
    const pitchPercent = previewPointToPitchPercent(testCase.ballPosition)
    const pitchY = (pitchPercent.y / 100) * PITCH.LENGTH

    assert.equal(getZoneNumberForY(pitchY), expectedZone, `${testCase.tabLabel}: visible initial ball zone`)
  })
})

test('every DT tab visibly transfers possession before pressure begins', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const firstStep = testCase.steps[0]

    assert.match(firstStep.id, /-loss$/)
    assertVisibleTurnover(firstStep, testCase.ballPosition, testCase.id)
    assert.ok(testCase.routes.some((route) => route.revealOnStepId === firstStep.id))
  })
})

test('AT Zone 2 #9 checks onside before the forward pass is released', () => {
  const zone2 = ATTACKING_TRANSITION_PAGE_CASES.find((testCase) => testCase.id === 'zone-2')

  assert.ok(zone2)
  assertAttackerOnsideAtStepStart(zone2, 'zone-2-target', ['home-9'])
})

test('AT Zone 3 #7 and #9 begin behind the line and #9 stays legal for the final pass', () => {
  const zone3 = ATTACKING_TRANSITION_PAGE_CASES.find((testCase) => testCase.id === 'zone-3')

  assert.ok(zone3)
  assertAttackerOnsideAtStepStart(zone3, 'zone-3-channel', ['home-7', 'home-9'])
  assertAttackerOnsideAtStepStart(zone3, 'zone-3-finish', ['home-9'])
})
