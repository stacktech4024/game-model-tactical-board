/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ATTACKING_ORGANIZATION_SERVICE_VISUALS,
  ATTACKING_ORGANIZATION_SKILL_OPTIONS,
  ATTACKING_ORGANIZATION_SKILL_VISUALS,
  ATTACKING_ORGANIZATION_STATE_VISUALS,
  getGameAnalysisReplayKey,
  isCurrentGameAnalysisReplay,
  type AttackingOrganizationVisual,
} from './attackingOrganizationPageData.ts'

function assertBallSequenceIsContinuous(visual: AttackingOrganizationVisual): void {
  let currentBall = visual.ballPosition

  visual.steps.forEach((step) => {
    if (!step.ballFrom) {
      return
    }

    assert.deepEqual(
      step.ballFrom,
      currentBall,
      `${visual.id} ${step.id}: ball must begin where the previous action ended`,
    )
    assert.ok(step.ballTo, `${visual.id} ${step.id}: ball movement needs a target`)
    currentBall = step.ballTo
  })
}

test('System, Strategy, and Tactics are distinct full-team visual definitions', () => {
  const visuals = Object.values(ATTACKING_ORGANIZATION_STATE_VISUALS)

  assert.equal(new Set(visuals.map((visual) => visual.id)).size, 3)

  visuals.forEach((visual) => {
    assert.equal(visual.players.filter((player) => player.id.startsWith('home-')).length, 11)
    assert.equal(visual.players.filter((player) => player.id.startsWith('away-')).length, 11)
    assert.equal(new Set(visual.players.map((player) => player.id)).size, 22)
    assert.ok(visual.players.some((player) => player.id === 'home-2' && player.x >= 80), `${visual.id}: #2 must be clearly visible in the wide channel`)
    assert.equal(visual.steps[0].emphasizePlayerId, 'home-2', `${visual.id}: initial cue should identify #2 clearly`)

    const movingOpponents = new Set(
      visual.steps.flatMap((step) => step.playerMoves ?? [])
        .map((move) => move.playerId)
        .filter((playerId) => playerId.startsWith('away-')),
    )

    assert.ok(movingOpponents.size >= 8, `${visual.id}: defending team needs coordinated movement across the unit`)
    assertBallSequenceIsContinuous(visual)
  })
})

test('all main states end with a visible goal action', () => {
  Object.values(ATTACKING_ORGANIZATION_STATE_VISUALS).forEach((visual) => {
    const finalBallStep = visual.steps.filter((step) => step.ballTo).at(-1)

    if (!finalBallStep) {
      assert.fail(`${visual.id}: expected a final ball action`)
    }

    assert.ok(finalBallStep.id.endsWith('goal'))
    assert.ok(finalBallStep.ballTo!.y <= 1, `${visual.id}: final ball must reach the top opponent goal`)
    assert.match(finalBallStep.cue, /goal/i)
  })
})

test('Strategy contains the required wide-channel progression in authored order', () => {
  const stepIds = ATTACKING_ORGANIZATION_STATE_VISUALS.Strategy.steps.map((step) => step.id)

  assert.deepEqual(stepIds, [
    'strategy-message',
    'strategy-gk-three',
    'strategy-three-four',
    'strategy-find-two',
    'strategy-two-progress',
    'strategy-two-ten',
    'strategy-return-two',
    'strategy-cross',
    'strategy-goal',
  ])
})

test('Tactics exposes more detailed coordinated routes than Strategy', () => {
  const tactics = ATTACKING_ORGANIZATION_STATE_VISUALS.Tactics
  const strategy = ATTACKING_ORGANIZATION_STATE_VISUALS.Strategy

  assert.ok(tactics.routes.length > strategy.routes.length)
  assert.equal(strategy.routes.filter((route) => !route.revealOnStepId).length, 0)
  assert.ok(tactics.routes.filter((route) => !route.revealOnStepId).length >= 6)
  ;['tactics-four-support-route', 'tactics-seven-clear-route', 'tactics-overlap-route', 'tactics-seven-run-route', 'tactics-nine-run-route', 'tactics-eleven-run-route'].forEach((routeId) => {
    assert.ok(tactics.routes.some((route) => route.id === routeId), `Tactics: missing ${routeId}`)
  })
})

test('Skill Set provides the five required separate teaching examples', () => {
  assert.deepEqual(
    ATTACKING_ORGANIZATION_SKILL_OPTIONS.map((skill) => skill.label),
    [
      'Scanning before receiving',
      'Body shape to receive forward',
      'Receiving on the move',
      'Timing of overlap',
      'Cross / Cut back',
    ],
  )

  Object.values(ATTACKING_ORGANIZATION_SKILL_VISUALS).forEach((visual) => {
    assert.equal(visual.players.filter((player) => player.id.startsWith('home-')).length, 11)
    assert.equal(visual.players.filter((player) => player.id.startsWith('away-')).length, 11)
    assertBallSequenceIsContinuous(visual)
  })
})

test('scanning rotates midfield #8 twice before the pass while body-shape turns midfield #6 forward', () => {
  const scanning = ATTACKING_ORGANIZATION_SKILL_VISUALS.scanning
  const bodyShape = ATTACKING_ORGANIZATION_SKILL_VISUALS['body-shape']
  const receiving = ATTACKING_ORGANIZATION_SKILL_VISUALS['receiving-on-the-move']
  const scanningPlayer = scanning.players.find((player) => player.id === 'home-8')
  const bodyPlayer = bodyShape.players.find((player) => player.id === 'home-6')
  const receivingPlayer = receiving.players.find((player) => player.id === 'home-2')
  const scanningWidePlayer = scanning.players.find((player) => player.id === 'home-2')
  const scanSource = scanning.steps.find((step) => step.id === 'scan-source')
  const scanOption = scanning.steps.find((step) => step.id === 'scan-option')
  const scanSetToReceive = scanning.steps.find((step) => step.id === 'scan-set-to-receive')
  const scanningReceive = scanning.steps.find((step) => step.id === 'scan-receive')
  const scanTurnToOption = scanning.steps.find((step) => step.id === 'scan-turn-to-option')
  const scanningPlay = scanning.steps.find((step) => step.id === 'scan-play')
  const bodyReceive = bodyShape.steps.find((step) => step.id === 'body-receive-forward')
  const bodyPass = bodyShape.steps.find((step) => step.id === 'body-play-two')
  const bodyWidePlayer = bodyShape.players.find((player) => player.id === 'home-2')

  assert.equal(scanningPlayer?.facingAngle, 0)
  assert.equal(bodyPlayer?.facingAngle, -90)
  assert.equal(receivingPlayer?.facingAngle, 25)
  assert.equal(scanSource?.playerId, 'home-8')
  assert.equal(scanOption?.playerId, 'home-8')
  assert.equal(scanSource?.ballFrom, undefined)
  assert.equal(scanOption?.ballFrom, undefined)
  assert.equal(scanSource?.playerTo, undefined)
  assert.equal(scanOption?.playerTo, undefined)
  assert.notEqual(scanSource?.facingAngle, scanOption?.facingAngle)
  assert.equal(scanSetToReceive?.facingAngle, scanSource?.facingAngle)
  assert.equal(scanSetToReceive?.ballFrom, undefined)
  assert.ok(scanning.steps.indexOf(scanSource!) < scanning.steps.indexOf(scanningReceive!))
  assert.ok(scanning.steps.indexOf(scanOption!) < scanning.steps.indexOf(scanningReceive!))
  assert.ok(scanning.steps.indexOf(scanSetToReceive!) < scanning.steps.indexOf(scanningReceive!))
  assert.ok(scanning.steps.indexOf(scanningReceive!) < scanning.steps.indexOf(scanTurnToOption!))
  assert.ok(scanning.steps.indexOf(scanTurnToOption!) < scanning.steps.indexOf(scanningPlay!))
  assert.equal(scanTurnToOption?.facingAngle, scanOption?.facingAngle)
  assert.equal(scanTurnToOption?.ballFrom, undefined)
  assert.deepEqual(scanningPlay?.ballTo, {
    x: scanningWidePlayer?.x,
    y: scanningWidePlayer?.y,
  })
  assert.equal(bodyReceive?.playerId, 'home-6')
  assert.deepEqual(bodyReceive?.playerTo, bodyReceive?.ballTo)
  assert.equal(bodyReceive?.facingAngle, 0)
  assert.equal(bodyPass?.playerId, 'home-6')
  assert.equal(bodyPass?.facingAngle, 70)
  assert.deepEqual(bodyPass?.ballTo, {
    x: bodyWidePlayer?.x,
    y: bodyWidePlayer?.y,
  })
  assert.notEqual(scanSource?.playerId, bodyReceive?.playerId)
  assert.ok(receiving.steps.filter((step) => step.playerId === 'home-2' && step.playerTo).length >= 2)
})

test('Cross and Cut back use different build-ups and different delivery directions', () => {
  const cross = ATTACKING_ORGANIZATION_SERVICE_VISUALS.Cross
  const cutBack = ATTACKING_ORGANIZATION_SERVICE_VISUALS['Cut back']
  const crossDelivery = cross.steps.find((step) => step.id === 'cross-delivery')
  const cutBackDelivery = cutBack.steps.find((step) => step.id === 'cutback-delivery')

  assert.notDeepEqual(cross.ballPosition, cutBack.ballPosition)
  assert.equal(cross.players.length, 22)
  assert.equal(cutBack.players.length, 22)
  assert.notEqual(cross.steps[0].id, cutBack.steps[0].id)
  assert.ok(crossDelivery?.ballFrom && crossDelivery.ballTo)
  assert.ok(cutBackDelivery?.ballFrom && cutBackDelivery.ballTo)
  assert.ok(crossDelivery.ballTo.y < crossDelivery.ballFrom.y, 'Cross should travel farther up the pitch/across goal')
  assert.ok(cutBackDelivery.ballTo.y > cutBackDelivery.ballFrom.y, 'Cut back should travel backward toward support')
  assert.ok(crossDelivery.ballFrom.y <= 12, 'Cross should be delivered from deep in Zone 4')
  assert.ok(cutBackDelivery.ballFrom.y <= 10, 'Cut back should originate even deeper in the Zone 4 corner grid')
  assertBallSequenceIsContinuous(cross)
  assertBallSequenceIsContinuous(cutBack)
})

test('Cross finishes with #11 arriving from the wider weak-side start', () => {
  const cross = ATTACKING_ORGANIZATION_SERVICE_VISUALS.Cross
  const numberEleven = cross.players.find((player) => player.id === 'home-11')
  const delivery = cross.steps.find((step) => step.id === 'cross-delivery')
  const elevenArrival = delivery?.playerMoves?.find((move) => move.playerId === 'home-11')
  const contact = cross.steps.find((step) => step.id === 'cross-contact')
  const goal = cross.steps.find((step) => step.id === 'cross-goal')

  assert.ok(numberEleven && numberEleven.x <= 20, '#11 should start from genuine weak-side width')
  assert.ok(elevenArrival)
  assert.deepEqual(delivery?.ballTo, elevenArrival.to, 'the cross should arrive at #11')
  assert.equal(contact?.emphasizePlayerId, 'home-11')
  assert.equal(goal?.playerId, 'home-11')
  assert.equal(goal?.ballTo?.y, 0)
})

test('both Cross and Cut back finish with the ball in the goal', () => {
  Object.values(ATTACKING_ORGANIZATION_SERVICE_VISUALS).forEach((visual) => {
    const finalBallStep = visual.steps.filter((step) => step.ballTo).at(-1)

    assert.equal(finalBallStep?.ballTo?.y, 0, `${visual.id} must end at the goal line`)
    assert.ok(finalBallStep?.cue.includes('Goal'), `${visual.id} must visibly call out the goal`)
  })
})

test('overlap timing uses a back-line #2 and a smooth #2-to-#8-to-#7-to-#2 pattern', () => {
  const overlap = ATTACKING_ORGANIZATION_SKILL_VISUALS['overlap-timing']
  const numberTwo = overlap.players.find((player) => player.id === 'home-2')
  const numberThree = overlap.players.find((player) => player.id === 'home-3')
  const numberEight = overlap.players.find((player) => player.id === 'home-8')
  const passToEight = overlap.steps.find((step) => step.id === 'overlap-two-eight')
  const advance = overlap.steps.find((step) => step.id === 'overlap-two-advance')
  const passToSeven = overlap.steps.find((step) => step.id === 'overlap-eight-seven')
  const overlapRun = overlap.steps.find((step) => step.id === 'overlap-go')
  const release = overlap.steps.find((step) => step.id === 'overlap-release')
  const awayBackLineY = Math.max(
    ...['away-2', 'away-3', 'away-4', 'away-5'].map((id) => overlap.players.find((player) => player.id === id)!.y),
  )
  const awayMidfieldY = Math.min(
    ...['away-6', 'away-8'].map((id) => overlap.players.find((player) => player.id === id)!.y),
  )

  assert.deepEqual(overlap.ballPosition, { x: numberTwo?.x, y: numberTwo?.y })
  assert.ok(numberTwo && numberThree)
  assert.ok(Math.abs(numberTwo.y - numberThree.y) <= 10, '#2 should begin on the same back-line band as #3')
  assert.deepEqual(passToEight?.ballTo, { x: numberEight?.x, y: numberEight?.y })
  assert.equal(advance?.playerId, 'home-2')
  assert.equal(passToSeven?.playerId, 'home-7')
  assert.deepEqual(passToSeven?.playerTo, passToSeven?.ballTo)
  assert.equal(overlapRun?.playerId, 'home-2')
  assert.ok(overlapRun?.playerTo && overlapRun.playerTo.x >= 90 && overlapRun.playerTo.y <= 15)
  assert.deepEqual(release?.ballTo, overlapRun?.playerTo)

  ;['home-7', 'home-9', 'home-11'].forEach((id) => {
    const player = overlap.players.find((item) => item.id === id)

    assert.ok(player)
    assert.ok(player.y > awayBackLineY && player.y < awayMidfieldY, `${id} should start between the lines`)
  })

  assert.deepEqual(
    overlap.steps.map((step) => step.id),
    [
      'overlap-picture',
      'overlap-two-eight',
      'overlap-two-advance',
      'overlap-eight-seven',
      'overlap-go',
      'overlap-release',
    ],
  )
  assertBallSequenceIsContinuous(overlap)
})

test('Cut back isolates #2 wide and uses realistic line-breaking occupation', () => {
  const cutBack = ATTACKING_ORGANIZATION_SERVICE_VISUALS['Cut back']
  const homePlayers = cutBack.players.filter((player) => player.id.startsWith('home-'))
  const wideHomePlayers = homePlayers.filter((player) => player.x >= 85)
  const awayBackLineY = Math.max(
    ...['away-2', 'away-3', 'away-4', 'away-5'].map((id) => cutBack.players.find((player) => player.id === id)!.y),
  )
  const awayMidfieldY = Math.min(
    ...['away-6', 'away-8'].map((id) => cutBack.players.find((player) => player.id === id)!.y),
  )

  assert.deepEqual(wideHomePlayers.map((player) => player.id), ['home-2'])
  assert.equal(cutBack.ballPosition.x, cutBack.players.find((player) => player.id === 'home-2')?.x)

  ;['home-7', 'home-9', 'home-11', 'home-8', 'home-10'].forEach((id) => {
    const player = cutBack.players.find((item) => item.id === id)

    assert.ok(player)
    assert.ok(
      player.y > awayBackLineY && player.y < awayMidfieldY,
      `${id} should begin between the opposition midfield and back line`,
    )
  })

  ;['cutback-seven-run', 'cutback-nine-run', 'cutback-eleven-run'].forEach((routeId) => {
    assert.ok(cutBack.routes.some((route) => route.id === routeId))
  })

  const goalStep = cutBack.steps.at(-1)

  assert.equal(goalStep?.id, 'cutback-goal')
  assert.equal(goalStep?.playerId, 'home-8')
  assert.ok(goalStep?.ballTo && goalStep.ballTo.y <= 1)
  assert.match(goalStep?.cue ?? '', /goal/i)
})

test('replay keys change for re-click revisions and state changes', () => {
  const firstSystemRun = getGameAnalysisReplayKey('System', 'system-unit-progression', 0)
  const replayedSystemRun = getGameAnalysisReplayKey('System', 'system-unit-progression', 1)
  const strategyRun = getGameAnalysisReplayKey('Strategy', 'strategy-wide-channel-pattern', 1)

  assert.notEqual(firstSystemRun, replayedSystemRun)
  assert.notEqual(replayedSystemRun, strategyRun)
  assert.equal(isCurrentGameAnalysisReplay(replayedSystemRun, replayedSystemRun), true)
  assert.equal(isCurrentGameAnalysisReplay(strategyRun, replayedSystemRun), false)
})
