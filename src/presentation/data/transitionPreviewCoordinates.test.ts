/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { PITCH, getZoneNumberForY } from '../../domain/pitch/pitchConstants.ts'
import type { PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview.tsx'
import {
  ATTACKING_TRANSITION_PAGE_CASES,
  getTransitionFacingAngle,
  type AttackingTransitionPageCase,
} from './attackingTransitionPageData.ts'
import {
  DEFENSIVE_TRANSITION_PAGE_CASES,
  DEFENSIVE_TRANSITION_PAGE_DEFAULT_CASE_ID,
} from './defensiveTransitionPageData.ts'
import {
  formationMetresToPitchPercentPositions,
  previewPointToPitchPercent,
} from './transitionPreviewCoordinates.ts'

type PreviewPoint = { x: number; y: number }
type TransitionPreview = {
  id: string
  players: AttackingTransitionPageCase['players']
}

function getPlayer(testCase: TransitionPreview, id: string) {
  const player = testCase.players.find((item) => item.id === id)

  assert.ok(player, `${testCase.id}: expected player ${id}`)

  return player
}

function assertAngleClose(actual: number | undefined, expected: number, message: string): void {
  assert.ok(Number.isFinite(actual), `${message}: angle must be finite`)

  const difference = Math.abs((((actual as number) - expected + 180) % 360) - 180)

  assert.ok(difference < 0.001, `${message}: expected ${expected}, received ${actual}`)
}

function pointDistance(first: PreviewPoint, second: PreviewPoint): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function getFinalPlayerPositions(testCase: (typeof DEFENSIVE_TRANSITION_PAGE_CASES)[number]) {
  const positions = new Map(
    testCase.players.map((player) => [player.id, { x: player.x, y: player.y }]),
  )

  testCase.steps.forEach((step) => {
    if (step.playerId && step.playerTo) {
      positions.set(step.playerId, step.playerTo)
    }
    step.playerMoves?.forEach((move) => positions.set(move.playerId, move.to))
  })

  return positions
}

function assertVisuallyAttached(
  ball: PreviewPoint | undefined,
  player: PreviewPoint | undefined,
  message: string,
): void {
  assert.ok(ball && player, `${message}: ball and player positions are required`)

  const distance = pointDistance(ball, player)

  assert.ok(distance >= 1 && distance <= 2, `${message}: expected a readable 1–2 unit offset, received ${distance}`)
}

function assertVisibleDefensiveTurnover(
  step: PixiPitchPreviewStep,
  caseId: string,
): void {
  assert.ok(step.ballFrom, `${caseId}: turnover step needs ballFrom`)
  assert.ok(step.ballTo, `${caseId}: turnover step needs ballTo`)
  assert.notDeepEqual(step.ballFrom, step.ballTo, `${caseId}: turnover must visibly move the ball`)
  assert.ok(step.playerId?.startsWith('away-'), `${caseId}: an opponent must collect the turnover`)
  assertVisuallyAttached(step.ballTo, step.playerTo, `${caseId}: opponent collection`)
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

test('every DT tab loses the ball in its labelled canonical zone', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const expectedZone = Number(testCase.id.at(-1))
    const loss = testCase.steps.find((step) => step.id === testCase.lossStepId)

    assert.ok(loss?.ballTo, `${testCase.id}: loss endpoint`)

    const pitchPercent = previewPointToPitchPercent(loss.ballTo)
    const pitchY = (pitchPercent.y / 100) * PITCH.LENGTH

    assert.equal(getZoneNumberForY(pitchY), expectedZone, `${testCase.tabLabel}: visible loss zone`)
  })
})

test('every DT tab begins with Canada in possession before the visible loss', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const initialPossessor = getPlayer(testCase, testCase.initialPossessorId)
    const possession = testCase.steps[0]
    const lossIndex = testCase.steps.findIndex((step) => step.id === testCase.lossStepId)
    const loss = testCase.steps[lossIndex]

    assert.equal(possession.id, testCase.possessionStepId)
    assert.equal(possession.emphasizePlayerId, testCase.initialPossessorId)
    assert.equal(possession.ballFrom, undefined)
    assert.equal(possession.ballTo, undefined)
    assertVisuallyAttached(
      testCase.ballPosition,
      { x: initialPossessor.x, y: initialPossessor.y },
      `${testCase.id}: initial Canada possession`,
    )

    assert.equal(loss.id, testCase.lossStepId)
    assert.ok(lossIndex > 0)
    assert.ok(loss.ballFromPlayerId?.startsWith('home-'))
    assert.equal(loss.ballToPlayerId, loss.playerId)
    assertVisibleDefensiveTurnover(loss, testCase.id)
    assert.ok(testCase.routes.some((route) => route.revealOnStepId === loss.id))
  })
})

test('all DT zones include connected Canada actions and layered opponent reactions before the loss', () => {
  const expectedCanadaActionCounts = {
    'zone-1': 2,
    'zone-2': 2,
    'zone-3': 3,
    'zone-4': 8,
  } as const

  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const lossIndex = testCase.steps.findIndex((step) => step.id === testCase.lossStepId)
    const CanadaActions = testCase.steps.slice(0, lossIndex).filter((step) =>
      step.ballFromPlayerId?.startsWith('home-') && step.ballToPlayerId?.startsWith('home-'),
    )

    assert.equal(
      CanadaActions.length,
      expectedCanadaActionCounts[testCase.id],
      `${testCase.id}: authored Canada buildup actions`,
    )
    CanadaActions.forEach((step) => {
      assert.ok(
        step.playerMoves?.some((move) => move.playerId.startsWith('away-')),
        `${testCase.id} ${step.id}: opponent reacts to the buildup`,
      )

      const backLineMoves = step.playerMoves?.filter((move) => /^away-[2-5]$/.test(move.playerId)) ?? []

      assert.ok(
        backLineMoves.length <= 3,
        `${testCase.id} ${step.id}: at least one grey defender holds rather than moving as a wall`,
      )
      if (backLineMoves.length > 1) {
        assert.equal(
          new Set(backLineMoves.map((move) => move.startDelay ?? 0)).size,
          backLineMoves.length,
          `${testCase.id} ${step.id}: grey back-line reactions are staggered`,
        )
      }
    })
    const shiftingDefenders = new Set(
      CanadaActions.flatMap((step) =>
        step.playerMoves?.filter((move) => /^away-[2-5]$/.test(move.playerId))
          .map((move) => move.playerId) ?? [],
      ),
    )

    assert.deepEqual(
      [...shiftingDefenders].sort(),
      ['away-2', 'away-3', 'away-4', 'away-5'],
      `${testCase.id}: ball-side cover responds while the far side can hold`,
    )
  })
})

test('every DT tab gives the opponent a counter action before Canada reacts', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const lossIndex = testCase.steps.findIndex((step) => step.id === testCase.lossStepId)
    const loss = testCase.steps[lossIndex]
    const counter = testCase.steps[lossIndex + 1]
    const firstDefensiveReaction = testCase.steps[lossIndex + 2]

    assert.equal(counter.id, testCase.counterStepId)
    assert.equal(counter.ballFromPlayerId, loss.ballToPlayerId)
    assert.ok(counter.ballFromPlayerId?.startsWith('away-'))
    assert.ok(counter.ballToPlayerId?.startsWith('away-'))
    assert.deepEqual(counter.ballFrom, loss.ballTo)
    assert.notDeepEqual(counter.ballFrom, counter.ballTo)
    assert.ok(counter.playerMoves?.some((move) => move.playerId.startsWith('away-')))
    assert.match(counter.cue, /Opponent counter/i)
    assert.match(firstDefensiveReaction.id, /-(press|delay)$/)
    assert.ok(testCase.routes.some((route) => route.revealOnStepId === counter.id))
  })
})

test('every DT counter includes grey runners, midfield support, layered back-line cover, and a reset', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const counterIndex = testCase.steps.findIndex((step) => step.id === testCase.counterStepId)
    const counter = testCase.steps[counterIndex]
    const supportIds = new Set([
      ...(counter.playerId ? [counter.playerId] : []),
      ...(counter.playerMoves?.map((move) => move.playerId) ?? []),
    ])
    const reset = testCase.steps.slice(counterIndex + 1).find((step) => step.id.endsWith('grey-reset'))

    assert.ok([...supportIds].some((id) => /^away-(7|9|11)$/.test(id)), `${testCase.id}: forward runner`)
    assert.ok([...supportIds].some((id) => /^away-(6|8|10)$/.test(id)), `${testCase.id}: midfield support`)
    const steppingBackLine = counter.playerMoves?.filter((move) => /^away-[2-5]$/.test(move.playerId)) ?? []

    assert.ok(
      steppingBackLine.length >= 1 && steppingBackLine.length <= 2,
      `${testCase.id}: one or two defenders support while the far side holds`,
    )
    assert.ok(
      steppingBackLine.every((move) => (move.startDelay ?? 0) > 0),
      `${testCase.id}: back-line support arrives after the runners and midfield`,
    )
    assert.ok(reset, `${testCase.id}: grey reset before loop restart`)
    assert.ok(
      (reset.playerMoves?.filter((move) => move.playerId.startsWith('away-')).length ?? 0) >= 4,
      `${testCase.id}: connected grey reset`,
    )
  })
})

test('Defensive Transition makes the loss readable without slowing the reaction sequence', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const lossIndex = testCase.steps.findIndex((step) => step.id === testCase.lossStepId)
    const counterIndex = testCase.steps.findIndex((step) => step.id === testCase.counterStepId)
    const buildupDuration = testCase.steps
      .slice(0, lossIndex)
      .reduce((total, step) => total + step.duration, 0)
    const lossAndCounterDuration = testCase.steps
      .slice(lossIndex, counterIndex + 1)
      .reduce((total, step) => total + step.duration, 0)
    const totalDuration = testCase.steps.reduce((total, step) => total + step.duration, 0)

    const maximumBuildupDuration = testCase.id === 'zone-4' ? 2.55 : 1.5
    const maximumTotalDuration = testCase.id === 'zone-4' ? 5.4 : 4.4

    assert.ok(
      buildupDuration >= 1 && buildupDuration <= maximumBuildupDuration,
      `${testCase.id}: readable buildup`,
    )
    assert.ok(lossAndCounterDuration >= 0.85 && lossAndCounterDuration <= 1.05)
    assert.ok(totalDuration <= maximumTotalDuration, `${testCase.id}: defensive transition stays fast`)
  })
})

test('every DT tab preserves pressure, cover, central protection, back-line balance, and GK adjustment', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const counterIndex = testCase.steps.findIndex((step) => step.id === testCase.counterStepId)
    const reactions = testCase.steps.slice(counterIndex + 1)
    const movedPlayers = new Set(
      reactions.flatMap((step) => [
        ...(step.playerId ? [step.playerId] : []),
        ...(step.playerMoves?.map((move) => move.playerId) ?? []),
      ]),
    )
    const backLineMoves = ['home-2', 'home-3', 'home-4', 'home-5'].filter((playerId) =>
      movedPlayers.has(playerId),
    )

    assert.match(reactions[0]?.id ?? '', /-(press|delay)$/)
    assert.ok(reactions.some((step) => step.id.includes('cover')), `${testCase.id}: second defender cover`)
    assert.ok(movedPlayers.has('home-6'), `${testCase.id}: #6 central protection`)
    assert.ok(movedPlayers.has('home-8'), `${testCase.id}: #8 central protection`)
    assert.ok(backLineMoves.length >= 3, `${testCase.id}: connected back-line balance`)
    assert.ok(movedPlayers.has('home-1'), `${testCase.id}: goalkeeper set adjustment`)
  })
})

test('Zones 1–3 visibly recover #9 toward the team after the turnover', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.slice(0, 3).forEach((testCase) => {
    const lossIndex = testCase.steps.findIndex((step) => step.id === testCase.lossStepId)
    const recoveryStep = testCase.steps.slice(lossIndex + 1).find((step) =>
      step.playerMoves?.some((move) => move.playerId === 'home-9'),
    )
    const recoveryMove = recoveryStep?.playerMoves?.find((move) => move.playerId === 'home-9')
    const initialNine = previewPointToPitchPercent(getPlayer(testCase, 'home-9'))

    assert.ok(recoveryStep && recoveryMove, `${testCase.id}: #9 recovery movement`)

    const recoveryTarget = previewPointToPitchPercent(recoveryMove.to)

    assert.ok(recoveryTarget.y < initialNine.y - 10, `${testCase.id}: #9 drops toward halfway`)
    assert.ok(
      testCase.routes.some((route) =>
        route.id.includes('nine-recovery') && route.revealOnStepId === recoveryStep.id,
      ),
      `${testCase.id}: visible #9 recovery route`,
    )
  })
})

test('Zone 1 recovers #10 into a central screen after the loss', () => {
  const testCase = DEFENSIVE_TRANSITION_PAGE_CASES.find((item) => item.id === 'zone-1')

  assert.ok(testCase)

  const lossIndex = testCase.steps.findIndex((step) => step.id === testCase.lossStepId)
  const recoveryStep = testCase.steps.slice(lossIndex + 1).find((step) =>
    step.playerMoves?.some((move) => move.playerId === 'home-10'),
  )
  const recoveryMove = recoveryStep?.playerMoves?.find((move) => move.playerId === 'home-10')
  const initialTen = previewPointToPitchPercent(getPlayer(testCase, 'home-10'))

  assert.ok(recoveryStep && recoveryMove)

  const recoveryTarget = previewPointToPitchPercent(recoveryMove.to)

  assert.ok(recoveryTarget.y < initialTen.y - 8, 'zone-1: #10 makes a visible recovery run')
  assert.ok(
    testCase.routes.some((route) =>
      route.id.includes('ten-recovery') && route.revealOnStepId === recoveryStep.id,
    ),
    'zone-1: visible #10 recovery route',
  )
})

test('grey back lines stay ordered and compact when shifting to the loss', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const positions = new Map(
      testCase.players.map((player) => [player.id, { x: player.x, y: player.y }]),
    )
    const lossIndex = testCase.steps.findIndex((step) => step.id === testCase.lossStepId)

    testCase.steps.slice(0, lossIndex + 1).forEach((step) => {
      if (step.playerId && step.playerTo) positions.set(step.playerId, step.playerTo)
      step.playerMoves?.forEach((move) => positions.set(move.playerId, move.to))
    })

    const line = ['away-3', 'away-4', 'away-5', 'away-2'].map((id) => positions.get(id))

    assert.ok(line.every(Boolean), `${testCase.id}: complete grey back line`)

    const backLine = line as PreviewPoint[]
    const verticalSpread = Math.max(...backLine.map((point) => point.y))
      - Math.min(...backLine.map((point) => point.y))

    assert.ok(
      backLine.every((point, index) => index === 0 || backLine[index - 1].x < point.x),
      `${testCase.id}: grey back line remains laterally ordered`,
    )
    assert.ok(verticalSpread <= 6, `${testCase.id}: grey back line shifts compactly`)
  })
})

test('DT player movements avoid unrealistic cross-pitch jumps', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const positions = new Map(
      testCase.players.map((player) => [player.id, { x: player.x, y: player.y }]),
    )

    testCase.steps.forEach((step) => {
      const movements = [
        ...(step.playerId && step.playerTo ? [{ playerId: step.playerId, to: step.playerTo }] : []),
        ...(step.playerMoves ?? []),
      ]

      movements.forEach((move) => {
        const from = positions.get(move.playerId)

        assert.ok(from, `${testCase.id} ${step.id}: ${move.playerId} starting position`)
        assert.ok(
          pointDistance(from, move.to) <= 30,
          `${testCase.id} ${step.id}: ${move.playerId} cannot jump across the pitch`,
        )
        positions.set(move.playerId, move.to)
      })
    })
  })
})

test('Zone 1 and Zone 3 recover #9 into a distinct screening lane', () => {
  const separationGroups = {
    'zone-1': ['home-10'],
    'zone-3': ['home-10', 'home-6', 'home-8'],
  } as const

  Object.entries(separationGroups).forEach(([caseId, centralPlayerIds]) => {
    const testCase = DEFENSIVE_TRANSITION_PAGE_CASES.find((item) => item.id === caseId)

    assert.ok(testCase)

    const finalPositions = getFinalPlayerPositions(testCase)
    const nine = finalPositions.get('home-9')

    assert.ok(nine)
    centralPlayerIds.forEach((playerId) => {
      const centralPlayer = finalPositions.get(playerId)

      assert.ok(centralPlayer)
      assert.ok(
        pointDistance(nine, centralPlayer) >= 5,
        `${caseId}: #9 needs a separate screening lane from ${playerId}`,
      )
    })
  })
})

test('key players remain separated around each DT turnover and first pressure', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const positions = getFinalPlayerPositions(testCase)
    const counterIndex = testCase.steps.findIndex((step) => step.id === testCase.counterStepId)
    const counter = testCase.steps[counterIndex]
    const firstDefender = testCase.steps[counterIndex + 1]
    const secondDefender = testCase.steps[counterIndex + 2]

    const supportPlayerId = counter.playerMoves?.find((move) => move.playerId.startsWith('away-'))?.playerId
    const keyPlayerIds = [...new Set([
      counter.ballToPlayerId,
      firstDefender.playerId,
      secondDefender.playerId,
      'home-6',
      'home-8',
      supportPlayerId,
    ].filter((playerId): playerId is string => Boolean(playerId)))]

    keyPlayerIds.forEach((playerId, index) => {
      keyPlayerIds.slice(index + 1).forEach((otherPlayerId) => {
        const first = positions.get(playerId)
        const second = positions.get(otherPlayerId)

        assert.ok(first && second)
        assert.ok(
          pointDistance(first, second) >= 3,
          `${testCase.id}: ${playerId} and ${otherPlayerId} need distinct turnover lanes`,
        )
      })
    })
  })
})

test('Defensive Transition keeps four loss tabs with Zone 3 as the default', () => {
  assert.deepEqual(
    DEFENSIVE_TRANSITION_PAGE_CASES.map((testCase) => testCase.id),
    ['zone-1', 'zone-2', 'zone-3', 'zone-4'],
  )
  assert.equal(DEFENSIVE_TRANSITION_PAGE_DEFAULT_CASE_ID, 'zone-3')
})

test('default Zone 3 visibly demonstrates CONTROL & RESTRAINT against a live opponent escape', () => {
  const zone3 = DEFENSIVE_TRANSITION_PAGE_CASES.find((testCase) => testCase.id === 'zone-3')

  assert.ok(zone3)
  assert.ok(zone3.principles.includes('CONTROL & RESTRAINT'))
  assert.match(zone3.caption, /curves.*decelerates.*half-turned.*CONTROL & RESTRAINT/i)
  assert.match(zone3.coachingPoints.join(' '), /shorten the final steps.*hips half-open.*no lunge/i)

  const press = zone3.steps.find((step) => step.id === 'zone-3-press')
  const cover = zone3.steps.find((step) => step.id === 'zone-3-cover')
  const pressingTarget = previewPointToPitchPercent(press!.playerTo!)
  const firstCarrierTarget = previewPointToPitchPercent(press!.ballTo!)
  const controllingMove = cover?.playerMoves?.find((move) => move.playerId === 'home-7')
  const carrierMove = cover?.playerMoves?.find((move) => move.playerId === 'away-2')

  assert.equal(press?.ballFromPlayerId, 'away-2')
  assert.equal(press?.ballToPlayerId, 'away-2')
  assert.ok(press?.playerMoves?.some((move) => move.playerId === 'away-7'))
  assert.ok(press?.playerMoves?.some((move) => move.playerId === 'away-8'))
  assert.ok(Number.isFinite(press?.facingAngle))
  assert.ok(pointDistance(pressingTarget, firstCarrierTarget) >= 5, 'first defender must not collide with the carrier')
  assert.ok(pointDistance(pressingTarget, firstCarrierTarget) <= 10, 'first defender must apply usable pressure')

  assert.ok(controllingMove && carrierMove)
  assert.ok(Number.isFinite(controllingMove.facingAngle))
  assert.ok(Number.isFinite(carrierMove.facingAngle))
  const controlledTarget = previewPointToPitchPercent(controllingMove.to)
  const finalCarrierTarget = previewPointToPitchPercent(cover!.ballTo!)
  const controlledDistance = pointDistance(controlledTarget, finalCarrierTarget)

  assert.ok(controlledDistance >= 4 && controlledDistance <= 7.5, 'half-turned defender must delay without tackling through the carrier')
  assert.ok(zone3.routes.some((route) => route.id === 'zone-3-control-restraint'))
  assert.ok(zone3.routes.some((route) => route.id === 'zone-3-carrier-directed-wide'))
})

test('Zone 4 builds from the goalkeeper through #4, #6, and #8 before the final-third entry', () => {
  const zone4 = DEFENSIVE_TRANSITION_PAGE_CASES.find((testCase) => testCase.id === 'zone-4')

  assert.ok(zone4)

  const lossIndex = zone4.steps.findIndex((step) => step.id === zone4.lossStepId)
  const preLossSteps = zone4.steps.slice(0, lossIndex)
  const buildupPairs = preLossSteps
    .filter((step) => step.ballFromPlayerId && step.ballToPlayerId)
    .map((step) => [step.ballFromPlayerId, step.ballToPlayerId])
  const carry = preLossSteps.find((step) => step.id === 'zone-4-eight-carry')
  const release = preLossSteps.find((step) => step.id === 'zone-4-eight-releases-seven')
  const overlap = release?.playerMoves?.find((move) => move.playerId === 'home-2')

  assert.equal(zone4.initialPossessorId, 'home-1')
  assert.deepEqual(buildupPairs.slice(0, 5), [
    ['home-1', 'home-4'],
    ['home-4', 'home-6'],
    ['home-6', 'home-8'],
    ['home-8', 'home-8'],
    ['home-8', 'home-7'],
  ])
  assert.equal(carry?.ballFromPlayerId, 'home-8')
  assert.equal(carry?.ballToPlayerId, 'home-8')
  assert.equal(release?.ballFromPlayerId, 'home-8')
  assert.equal(release?.ballToPlayerId, 'home-7')
  assert.ok(overlap, '#2 continues beyond #7')
  assert.ok(
    zone4.routes.some((route) => route.id === 'zone-4-two-overlap' && route.type === 'run'),
    '#2 overlap is visible',
  )
  assert.ok(
    zone4.routes.some((route) => route.id === 'zone-4-eight-carry' && route.type === 'dribble'),
    '#8 carry is visible',
  )
})

test('Zone 4 advances Canada and retreats the grey block in layers through the thirds', () => {
  const zone4 = DEFENSIVE_TRANSITION_PAGE_CASES.find((testCase) => testCase.id === 'zone-4')

  assert.ok(zone4)

  const positions = new Map(
    zone4.players.map((player) => [player.id, previewPointToPitchPercent(player)]),
  )
  const initialPositions = new Map(positions)
  const carryIndex = zone4.steps.findIndex((step) => step.id === 'zone-4-eight-carry')

  zone4.steps.slice(0, carryIndex + 1).forEach((step) => {
    if (step.playerId && step.playerTo) positions.set(step.playerId, previewPointToPitchPercent(step.playerTo))
    step.playerMoves?.forEach((move) => positions.set(move.playerId, previewPointToPitchPercent(move.to)))
  })

  ;['home-2', 'home-3', 'home-4', 'home-5', 'home-6', 'home-7', 'home-8', 'home-9', 'home-10']
    .forEach((playerId) => {
      assert.ok(
        (positions.get(playerId)?.y ?? 0) > (initialPositions.get(playerId)?.y ?? 0),
        `${playerId} advances behind or ahead of the ball`,
      )
    })
  ;['away-2', 'away-4', 'away-5', 'away-6', 'away-8'].forEach((playerId) => {
    assert.ok(
      (positions.get(playerId)?.y ?? 0) > (initialPositions.get(playerId)?.y ?? 0),
      `${playerId} retreats toward goal as the block is broken`,
    )
  })
})

test('Zone 4 preserves #7 to #10 to #9 to #10 before the cutback interception', () => {
  const zone4 = DEFENSIVE_TRANSITION_PAGE_CASES.find((testCase) => testCase.id === 'zone-4')

  assert.ok(zone4)

  const lossIndex = zone4.steps.findIndex((step) => step.id === zone4.lossStepId)
  const actionPairs = zone4.steps.slice(0, lossIndex + 1)
    .filter((step) => step.ballFromPlayerId && step.ballToPlayerId)
    .map((step) => [step.ballFromPlayerId, step.ballToPlayerId])

  assert.deepEqual(actionPairs.slice(-4), [
    ['home-7', 'home-10'],
    ['home-10', 'home-9'],
    ['home-9', 'home-10'],
    ['home-10', 'away-9'],
  ])
})

test('Zone 4 grey reaction layers wide pressure, pivot screen, centre-back cover, and far-side narrowing', () => {
  const zone4 = DEFENSIVE_TRANSITION_PAGE_CASES.find((testCase) => testCase.id === 'zone-4')
  const carry = zone4?.steps.find((step) => step.id === 'zone-4-eight-carry')
  const delays = Object.fromEntries(
    carry?.playerMoves
      ?.filter((move) => ['away-2', 'away-6', 'away-5', 'away-4'].includes(move.playerId))
      .map((move) => [move.playerId, move.startDelay ?? 0]) ?? [],
  )

  assert.deepEqual(delays, {
    'away-2': 0,
    'away-6': 0.04,
    'away-5': 0.08,
    'away-4': 0.12,
  })
})

test('DT staggered reactions finish inside their authored action window', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    testCase.steps.forEach((step) => {
      step.playerMoves?.forEach((move) => {
        assert.ok(
          (move.startDelay ?? 0) <= step.duration - 0.16 + Number.EPSILON,
          `${testCase.id} ${step.id}: ${move.playerId} delay leaves time to complete`,
        )
      })
    })
  })
})

test('every DT ball movement stays attached to its named owner and receiver', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    const playerPositions = new Map(
      testCase.players.map((player) => [player.id, { x: player.x, y: player.y }]),
    )
    let currentBall = testCase.ballPosition

    testCase.steps.forEach((step) => {
      if (step.ballFrom) {
        assert.ok(step.ballTo, `${testCase.id} ${step.id}: ball movement needs an endpoint`)
        assert.ok(step.ballFromPlayerId, `${testCase.id} ${step.id}: ball owner must be named`)
        assert.ok(step.ballToPlayerId, `${testCase.id} ${step.id}: receiver must be named`)
        assert.deepEqual(step.ballFrom, currentBall, `${testCase.id} ${step.id}: continuous ball chain`)
        assertVisuallyAttached(
          step.ballFrom,
          playerPositions.get(step.ballFromPlayerId),
          `${testCase.id} ${step.id}: ball begins attached to ${step.ballFromPlayerId}`,
        )
      }

      if (step.playerId && step.playerTo) {
        playerPositions.set(step.playerId, step.playerTo)
      }
      step.playerMoves?.forEach((move) => playerPositions.set(move.playerId, move.to))

      if (step.ballTo && step.ballToPlayerId) {
        assertVisuallyAttached(
          step.ballTo,
          playerPositions.get(step.ballToPlayerId),
          `${testCase.id} ${step.id}: ball finishes attached to ${step.ballToPlayerId}`,
        )
        currentBall = step.ballTo
      }
    })
  })
})

test('Page 13 retains one attacking-transition case for each of the four zones', () => {
  assert.deepEqual(
    ATTACKING_TRANSITION_PAGE_CASES.map((scenario) => scenario.id),
    ['zone-1', 'zone-2', 'zone-3', 'zone-4'],
  )
})

test('Zones 1–3 circulate through multiple opponents before Canada regains', () => {
  ATTACKING_TRANSITION_PAGE_CASES.slice(0, 3).forEach((scenario) => {
    const turnoverIndex = scenario.steps.findIndex((step) => step.id === scenario.turnoverStepId)
    const opponentActions = scenario.steps.slice(0, turnoverIndex).filter((step) =>
      step.ballFromPlayerId?.startsWith('away-') && step.ballToPlayerId?.startsWith('away-'),
    )
    const turnover = scenario.steps[turnoverIndex]

    assert.ok(opponentActions.length >= 3, `${scenario.id}: needs a staged opponent build-up`)
    assert.equal(opponentActions[0]?.ballFromPlayerId, 'away-1')
    assert.notEqual(opponentActions[1]?.ballFromPlayerId, 'away-1', `${scenario.id}: circulation continues beyond the GK`)
    assert.notEqual(turnover.ballFromPlayerId, 'away-1', `${scenario.id}: regain cannot come directly from the GK`)
    assert.equal(opponentActions.at(-1)?.ballToPlayerId, turnover.ballFromPlayerId)
  })
})

test('Page 13 preserves the established Canadian post-regain actions', () => {
  const expectedPostRegainSteps = {
    'zone-1': ['zone-1-regain-scan', 'zone-1-gk-release', 'zone-1-ten-connects', 'zone-1-seven-released', 'zone-1-seven-enters', 'zone-1-cross', 'zone-1-finish'],
    'zone-2': ['zone-2-regain-scan', 'zone-2-ten-connects', 'zone-2-seven-released', 'zone-2-seven-enters', 'zone-2-cross', 'zone-2-finish'],
    'zone-3': ['zone-3-regain-scan', 'zone-3-ten-connects', 'zone-3-seven-released', 'zone-3-seven-enters', 'zone-3-cross', 'zone-3-finish'],
    'zone-4': ['zone-4-regain-scan', 'zone-4-seven-released', 'zone-4-cross', 'zone-4-finish'],
  }

  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const pauseIndex = scenario.steps.findIndex((step) => step.id === scenario.regainPauseStepId)

    assert.deepEqual(
      scenario.steps.slice(pauseIndex).map((step) => step.id),
      expectedPostRegainSteps[scenario.id],
    )
  })
})

test('Zone 4 keeps its established short-build, press, regain, release, cross, and finish sequence', () => {
  const zone4 = ATTACKING_TRANSITION_PAGE_CASES.find((scenario) => scenario.id === 'zone-4')

  assert.deepEqual(zone4?.steps.map((step) => step.id), [
    'zone-4-gk-distribution',
    'zone-4-front-press',
    'zone-4-midfield-lock',
    'zone-4-back-line-hold',
    'zone-4-turnover',
    'zone-4-regain-scan',
    'zone-4-seven-released',
    'zone-4-cross',
    'zone-4-finish',
  ])
})

test('Page 13 gives every regain a readable scan before Canada attacks', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const turnoverIndex = scenario.steps.findIndex((step) => step.id === scenario.turnoverStepId)
    const pause = scenario.steps[turnoverIndex + 1]
    const firstCanadaAction = scenario.steps
      .slice(turnoverIndex + 2)
      .find((step) => step.ballFromPlayerId?.startsWith('home-'))

    assert.equal(pause?.id, scenario.regainPauseStepId, `${scenario.id}: pause follows regain`)
    assert.match(pause.cue, /Regain pause.*scan/i)
    assert.ok(pause.duration >= 0.25 && pause.duration <= 0.4, `${scenario.id}: readable pause`)
    assert.equal(pause.ballFrom, undefined, `${scenario.id}: scan keeps the ball with the regaining player`)
    assert.equal(pause.ballTo, undefined, `${scenario.id}: scan precedes the first attacking action`)
    assert.ok(firstCanadaAction, `${scenario.id}: Canada attacks after the scan`)
  })
})

test('Page 13 active timing makes each regain readable and gives Zone 4 nearly five seconds', () => {
  const activeDurations = Object.fromEntries(
    ATTACKING_TRANSITION_PAGE_CASES.map((scenario) => [
      scenario.id,
      Number(scenario.steps.reduce((total, step) => total + step.duration, 0).toFixed(2)),
    ]),
  )

  assert.deepEqual(activeDurations, {
    'zone-1': 6.42,
    'zone-2': 5.99,
    'zone-3': 5.59,
    'zone-4': 4.86,
  })

  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const turnoverIndex = scenario.steps.findIndex((step) => step.id === scenario.turnoverStepId)
    const timeThroughRegain = scenario.steps
      .slice(0, turnoverIndex + 1)
      .reduce((total, step) => total + step.duration, 0)

    assert.ok(timeThroughRegain >= 1.2, `${scenario.id}: regain must not follow the GK action immediately`)
  })
})

test('Page 13 staggers pressing, support, forward release, and back-line adjustment', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const turnoverIndex = scenario.steps.findIndex((step) => step.id === scenario.turnoverStepId)
    const preRegainSteps = scenario.steps.slice(0, turnoverIndex + 1)
    const firstMovement = (playerId: string) => {
      const stepIndex = preRegainSteps.findIndex((step) =>
        step.playerMoves?.some((move) => move.playerId === playerId),
      )
      const move = preRegainSteps[stepIndex]?.playerMoves?.find((item) => item.playerId === playerId)

      return { stepIndex, startDelay: move?.startDelay ?? 0 }
    }
    const pressReaction = firstMovement('home-9')
    const midfieldReaction = firstMovement('home-6')
    const backLineReaction = firstMovement('home-4')
    const firstUnitProgression = scenario.steps
      .slice(turnoverIndex + 2)
      .find((step) => {
        const ids = new Set(step.playerMoves?.map((move) => move.playerId))

        return ids.has('home-6') && ids.has('home-9') && ids.has('home-4')
      })

    assert.ok(pressReaction.stepIndex >= 0, `${scenario.id}: front press reaction`)
    assert.ok(midfieldReaction.stepIndex >= 0, `${scenario.id}: midfield squeeze reaction`)
    assert.ok(backLineReaction.stepIndex >= 0, `${scenario.id}: back-line reaction`)
    assert.ok(pressReaction.stepIndex <= midfieldReaction.stepIndex, `${scenario.id}: front press reacts first`)
    assert.ok(midfieldReaction.stepIndex <= backLineReaction.stepIndex, `${scenario.id}: midfield reacts before the back line`)
    if (pressReaction.stepIndex === midfieldReaction.stepIndex) {
      assert.ok(pressReaction.startDelay < midfieldReaction.startDelay, `${scenario.id}: front delay precedes midfield`)
    }
    if (midfieldReaction.stepIndex === backLineReaction.stepIndex) {
      assert.ok(midfieldReaction.startDelay < backLineReaction.startDelay, `${scenario.id}: midfield delay precedes back line`)
    }
    assert.ok(firstUnitProgression, `${scenario.id}: connected unit progression step`)
    assert.equal(firstUnitProgression.playerMoves?.find((move) => move.playerId === 'home-6')?.startDelay, 0.08)
    assert.equal(firstUnitProgression.playerMoves?.find((move) => move.playerId === 'home-9')?.startDelay, 0.16)
    assert.equal(firstUnitProgression.playerMoves?.find((move) => move.playerId === 'home-4')?.startDelay, 0.26)
  })
})

test('every AT case starts with the ball attached to the away goalkeeper', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const initialPossessor = getPlayer(scenario, scenario.initialPossessorId)
    const distribution = scenario.steps[0]

    assert.equal(scenario.initialPossessorId, 'away-1')
    assert.equal(distribution.id, scenario.distributionStepId)
    assert.deepEqual(
      scenario.ballPosition,
      { x: initialPossessor.x, y: initialPossessor.y },
      `${scenario.id}: initial ball must be attached to the away goalkeeper`,
    )
    assert.deepEqual(distribution.ballFrom, scenario.ballPosition)
    assert.equal(distribution.ballFromPlayerId, 'away-1')
    assert.ok(distribution.ballToPlayerId?.startsWith('away-'))
    assert.ok(distribution.playerId?.startsWith('away-'))
    assert.deepEqual(distribution.playerTo, distribution.ballTo)
    assert.notDeepEqual(distribution.ballFrom, distribution.ballTo)
    assert.ok(scenario.routes.some((route) => route.revealOnStepId === distribution.id))
  })
})

test('each AT tab is labelled by the zone where Canada actually regains possession', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const expectedZone = Number(scenario.id.at(-1))
    const turnover = scenario.steps.find((step) => step.id === scenario.turnoverStepId)

    assert.ok(turnover?.ballTo, `${scenario.id}: turnover needs a Canada endpoint`)
    assert.ok(turnover.ballFromPlayerId?.startsWith('away-'))
    assert.ok(turnover.ballToPlayerId?.startsWith('home-'))
    assert.ok(turnover.playerId?.startsWith('home-'))
    assert.deepEqual(turnover.playerTo, turnover.ballTo)

    const regainPoint = previewPointToPitchPercent(turnover.ballTo)
    const regainY = (regainPoint.y / 100) * PITCH.LENGTH

    assert.equal(getZoneNumberForY(regainY), expectedZone, `${scenario.id}: regain zone`)
  })
})

test('goal-kick press starts with realistic vertical occupation for both teams', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const pitchPositions = new Map(
      scenario.players.map((player) => [player.id, previewPointToPitchPercent(player)]),
    )
    const yValues = (playerIds: string[]) =>
      playerIds.map((playerId) => pitchPositions.get(playerId)?.y ?? 0)
    const homeBackLine = yValues(['home-2', 'home-3', 'home-4', 'home-5'])
    const awayBackLine = yValues(['away-2', 'away-3', 'away-4', 'away-5'])
    const awayMidfield = yValues(['away-6', 'away-8', 'away-10'])
    const awayAttack = yValues(['away-7', 'away-9', 'away-11'])

    homeBackLine.forEach((y) => assert.ok(y >= 47 && y <= 55, `${scenario.id}: Canada back four protect halfway`))
    assert.ok(Math.max(...homeBackLine) - Math.min(...homeBackLine) <= 5, `${scenario.id}: Canada back four connected`)
    awayBackLine.forEach((y) => assert.ok(y >= 84, `${scenario.id}: away defenders provide low build-up`))
    awayMidfield.forEach((y) => assert.ok(y >= 65 && y <= 78, `${scenario.id}: away midfield supports low`))
    awayAttack.forEach((y) => assert.ok(y <= 55, `${scenario.id}: away attackers stay higher for the long ball`))
  })
})

test('every ball movement stays attached to its named owner and receiver', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const playerPositions = new Map(
      scenario.players.map((player) => [player.id, { x: player.x, y: player.y }]),
    )
    let currentBall = scenario.ballPosition

    scenario.steps.forEach((step, stepIndex) => {
      if (step.ballFrom) {
        assert.ok(step.ballTo, `${scenario.id} ${step.id}: ball movement needs an endpoint`)
        assert.ok(step.ballFromPlayerId, `${scenario.id} ${step.id}: ball owner must be named`)
        assert.deepEqual(step.ballFrom, currentBall, `${scenario.id} ${step.id}: ball chain must be continuous`)
        assert.deepEqual(
          step.ballFrom,
          playerPositions.get(step.ballFromPlayerId),
          `${scenario.id} ${step.id}: ball must start attached to ${step.ballFromPlayerId}`,
        )
      }

      if (step.playerId && step.playerTo) {
        playerPositions.set(step.playerId, step.playerTo)
      }

      step.playerMoves?.forEach((move) => {
        playerPositions.set(move.playerId, move.to)
      })

      if (step.ballTo) {
        if (step.ballToPlayerId) {
          assert.deepEqual(
            step.ballTo,
            playerPositions.get(step.ballToPlayerId),
            `${scenario.id} ${step.id}: ball must finish attached to ${step.ballToPlayerId}`,
          )
        } else {
          assert.equal(stepIndex, scenario.steps.length - 1, `${scenario.id}: only the final shot may lack a receiver`)
        }

        currentBall = step.ballTo
      }
    })
  })
})

test('every AT case crosses, finishes with a shot, and sends the ball into goal', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    assert.ok(scenario.routes.some((route) => route.type === 'cross'), `${scenario.id}: cross route`)

    const finalRoute = scenario.routes.filter((route) => route.type === 'shot').at(-1)
    const finalStep = scenario.steps.at(-1)

    assert.ok(finalRoute, `${scenario.id}: final shot route`)
    assert.ok(finalStep?.ballTo)
    assert.deepEqual(finalRoute.to, finalStep.ballTo)

    const goalEndpoint = previewPointToPitchPercent(finalRoute.to)

    assert.ok(goalEndpoint.y >= 100, `${scenario.id}: final shot reaches opponent goal line`)
    assert.ok(goalEndpoint.x >= 44 && goalEndpoint.x <= 56, `${scenario.id}: final shot is inside goal width`)
  })
})

test('#4, #5, and #6 advance behind the attack as connected rest-defence', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const positions = new Map(
      scenario.players.map((player) => [player.id, previewPointToPitchPercent(player)]),
    )
    const turnoverIndex = scenario.steps.findIndex((step) => step.id === scenario.turnoverStepId)
    const regainPositions = new Map<string, PreviewPoint>()

    scenario.steps.forEach((step, stepIndex) => {
      if (step.playerId && step.playerTo) {
        positions.set(step.playerId, previewPointToPitchPercent(step.playerTo))
      }
      step.playerMoves?.forEach((move) => {
        positions.set(move.playerId, previewPointToPitchPercent(move.to))
      })

      if (stepIndex === turnoverIndex) {
        positions.forEach((point, playerId) => regainPositions.set(playerId, point))
      }
    })

    ;['home-4', 'home-5', 'home-6'].forEach((playerId) => {
      const regain = regainPositions.get(playerId)
      const final = positions.get(playerId)

      assert.ok(regain && final, `${scenario.id}: ${playerId} needs tracked rest-defence positions`)
      assert.ok(final.y > regain.y, `${scenario.id}: ${playerId} advances behind play after the regain`)
    })
  })
})

test('Canada progresses in cohesive front, midfield, and back-line units', () => {
  const unitPlayerIds = {
    back: ['home-2', 'home-3', 'home-4', 'home-5'],
    midfield: ['home-6', 'home-8', 'home-10'],
    front: ['home-7', 'home-9', 'home-11'],
  }

  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const positions = new Map(
      scenario.players.map((player) => [player.id, previewPointToPitchPercent(player)]),
    )
    const turnoverIndex = scenario.steps.findIndex((step) => step.id === scenario.turnoverStepId)
    const regainY = new Map<string, number>()
    const hasAdvanced = new Set<string>()

    scenario.steps.forEach((step, stepIndex) => {
      const movements = [
        ...(step.playerId && step.playerTo ? [{ playerId: step.playerId, to: step.playerTo }] : []),
        ...(step.playerMoves ?? []),
      ]

      movements
        .filter((move) => move.playerId.startsWith('home-'))
        .forEach((move) => {
          const previous = positions.get(move.playerId)
          const target = previewPointToPitchPercent(move.to)

          assert.ok(previous, `${scenario.id}: ${move.playerId} needs a tracked position`)
          if (stepIndex > turnoverIndex && target.y > previous.y) {
            hasAdvanced.add(move.playerId)
          }

          positions.set(move.playerId, target)
        })

      const backLineY = unitPlayerIds.back.map((playerId) => positions.get(playerId)?.y ?? 0)
      const backLineSpread = Math.max(...backLineY) - Math.min(...backLineY)

      assert.ok(backLineSpread <= 14, `${scenario.id} ${step.id}: back four must stay connected`)

      if (stepIndex === turnoverIndex) {
        positions.forEach((point, playerId) => regainY.set(playerId, point.y))
      }
    })

    Object.values(unitPlayerIds).flat().forEach((playerId) => {
      assert.ok(hasAdvanced.has(playerId), `${scenario.id}: ${playerId} must progress with its unit`)
    })

    const averageY = (playerIds: string[]) =>
      playerIds.reduce((sum, playerId) => sum + (positions.get(playerId)?.y ?? 0), 0) /
      playerIds.length
    const regainAverageY = (playerIds: string[]) =>
      playerIds.reduce((sum, playerId) => sum + (regainY.get(playerId) ?? 0), 0) /
      playerIds.length
    const backAverage = averageY(unitPlayerIds.back)
    const midfieldAverage = averageY(unitPlayerIds.midfield)
    const frontAverage = averageY(unitPlayerIds.front)
    const centreBackAverage = averageY(['home-4', 'home-5'])
    const fullbackAverage = averageY(['home-2', 'home-3'])

    assert.ok(backAverage > regainAverageY(unitPlayerIds.back), `${scenario.id}: back line advances after regain`)
    assert.ok(midfieldAverage > regainAverageY(unitPlayerIds.midfield), `${scenario.id}: midfield advances after regain`)
    assert.ok(frontAverage > regainAverageY(unitPlayerIds.front), `${scenario.id}: front unit advances after regain`)
    assert.ok(midfieldAverage - backAverage <= 20, `${scenario.id}: midfield remains connected to back line`)
    assert.ok(frontAverage - midfieldAverage <= 25, `${scenario.id}: front remains connected to midfield`)
    assert.ok(centreBackAverage <= fullbackAverage, `${scenario.id}: #4 and #5 stay slightly deeper than the fullbacks`)
  })
})

test('the opponent forwards, midfield, and back line recover after every turnover', () => {
  const recoveryUnits = [
    ['away-9', 'away-10'],
    ['away-6', 'away-7', 'away-8', 'away-11'],
    ['away-2', 'away-3', 'away-4', 'away-5'],
  ]

  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const positions = new Map(
      scenario.players.map((player) => [player.id, previewPointToPitchPercent(player)]),
    )
    const turnoverIndex = scenario.steps.findIndex((step) => step.id === scenario.turnoverStepId)

    scenario.steps.slice(0, turnoverIndex).forEach((step) => {
      if (step.playerId && step.playerTo) {
        positions.set(step.playerId, previewPointToPitchPercent(step.playerTo))
      }
      step.playerMoves?.forEach((move) => {
        positions.set(move.playerId, previewPointToPitchPercent(move.to))
      })
    })

    const recoveryMoves = scenario.steps
      .slice(turnoverIndex, turnoverIndex + 3)
      .flatMap((step) => step.playerMoves ?? [])

    recoveryUnits.flat().forEach((playerId) => {
      const start = positions.get(playerId)
      const move = recoveryMoves.find((item) => item.playerId === playerId)

      assert.ok(start, `${scenario.id}: ${playerId} needs a pre-turnover position`)
      assert.ok(move, `${scenario.id}: ${playerId} must recover with its unit`)
      assert.ok(previewPointToPitchPercent(move.to).y > start.y, `${scenario.id}: ${playerId} recovers toward away goal`)
    })
  })
})

test('the away goalkeeper sets and dives during each final sequence', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const finalTwoSteps = scenario.steps.slice(-2)

    finalTwoSteps.forEach((step) => {
      assert.ok(step.playerMoves?.some((move) => move.playerId === 'away-1'), `${scenario.id} ${step.id}: goalkeeper action`)
    })
  })
})

test('body rotations are finite for receivers, runners, and stationary players', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    scenario.steps.forEach((step) => {
      if (step.playerId) {
        assert.ok(Number.isFinite(step.facingAngle), `${scenario.id} ${step.id}: receiver body angle`)
      }

      step.playerMoves?.forEach((move) => {
        assert.ok(Number.isFinite(move.facingAngle), `${scenario.id} ${step.id} ${move.playerId}: movement body angle`)
      })

      step.playerFacings?.forEach((facing) => {
        assert.ok(Number.isFinite(facing.facingAngle), `${scenario.id} ${step.id} ${facing.playerId}: holding body angle`)
      })

      const orientedPlayerCount =
        (step.playerId ? 1 : 0) +
        (step.playerMoves?.length ?? 0) +
        (step.playerFacings?.length ?? 0)

      assert.ok(orientedPlayerCount >= 10, `${scenario.id} ${step.id}: the active units need coordinated body orientation`)
    })
  })
})

test('the player releasing the ball faces the ball target', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    const positions = new Map(
      scenario.players.map((player) => [player.id, previewPointToPitchPercent(player)]),
    )

    scenario.steps.forEach((step) => {
      if (
        step.ballFromPlayerId &&
        step.ballTo &&
        step.ballFromPlayerId !== step.ballToPlayerId
      ) {
        const start = positions.get(step.ballFromPlayerId)
        const move = step.playerMoves?.find((item) => item.playerId === step.ballFromPlayerId)
        const stationaryFacing = step.playerFacings?.find(
          (item) => item.playerId === step.ballFromPlayerId,
        )
        const angle = move?.facingAngle ?? stationaryFacing?.facingAngle
        const facingFrom =
          move && step.ballFromPlayerId.startsWith('away-')
            ? previewPointToPitchPercent(move.to)
            : start

        assert.ok(facingFrom, `${scenario.id} ${step.id}: ball owner position`)
        assertAngleClose(
          angle,
          getTransitionFacingAngle(facingFrom, previewPointToPitchPercent(step.ballTo)),
          `${scenario.id} ${step.id}: ${step.ballFromPlayerId} faces the target`,
        )
      }

      if (step.playerId && step.playerTo) {
        positions.set(step.playerId, previewPointToPitchPercent(step.playerTo))
      }
      step.playerMoves?.forEach((move) => {
        positions.set(move.playerId, previewPointToPitchPercent(move.to))
      })
    })
  })
})

test('recovering opponents finish each movement facing the new ball location', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    scenario.steps.forEach((step) => {
      if (!step.ballTo) {
        return
      }

      const ballTarget = previewPointToPitchPercent(step.ballTo)

      step.playerMoves
        ?.filter((move) => move.playerId.startsWith('away-'))
        .forEach((move) => {
          const defenderEnd = previewPointToPitchPercent(move.to)

          assertAngleClose(
            move.facingAngle,
            getTransitionFacingAngle(defenderEnd, ballTarget),
            `${scenario.id} ${step.id}: ${move.playerId} stays open to the ball`,
          )
        })
    })
  })
})

test('receivers open toward their next ball action', () => {
  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    scenario.steps.forEach((step, stepIndex) => {
      if (!step.playerId || !step.playerTo || !step.ballToPlayerId) {
        return
      }

      const nextAction = scenario.steps
        .slice(stepIndex + 1)
        .find((candidate) => candidate.ballFromPlayerId === step.ballToPlayerId)
      const target = nextAction?.ballTo ?? { x: 50, y: 0 }

      assertAngleClose(
        step.facingAngle,
        getTransitionFacingAngle(
          previewPointToPitchPercent(step.playerTo),
          previewPointToPitchPercent(target),
        ),
        `${scenario.id} ${step.id}: ${step.playerId} opens toward the next action`,
      )
    })
  })
})

test('Page 13 uses the required Canada Soccer terms and principles', () => {
  const evaluatorCopy = ATTACKING_TRANSITION_PAGE_CASES.flatMap((scenario) => [
    scenario.zoneFocus,
    scenario.caption,
    scenario.strategy,
    ...scenario.steps.map((step) => step.cue),
  ]).join(' ')

  ;['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Channel 1', 'Channel 3'].forEach((term) => {
    assert.match(evaluatorCopy, new RegExp(term))
  })

  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    assert.deepEqual(scenario.principles, ['DISPERSAL', 'SUPPORT', 'MOBILITY', 'PENETRATION'])
  })
})

test('Page 13 exposes a compact System, Strategy, Tactics, and Skill Set panel', () => {
  const pageSource = readFileSync(
    new URL('../pages/AttackingTransitionPage.tsx', import.meta.url),
    'utf8',
  )

  ;['Game plan', 'System + Strategy', 'Movement sequence', 'Tactics', 'Coaching points', 'Key tags', 'Skill Set + Principles'].forEach((term) => {
    assert.match(pageSource, new RegExp(term.replace('+', '\\+')))
  })

  ATTACKING_TRANSITION_PAGE_CASES.forEach((scenario) => {
    assert.equal(scenario.tactics.length, 4, `${scenario.id}: exactly four numbered movement steps`)
    assert.ok(scenario.coachingPoints.length >= 1 && scenario.coachingPoints.length <= 3)
    assert.ok(scenario.principles.length <= 4, `${scenario.id}: no more than four visible key tags`)
  })
})

test('Defensive Transition exposes the compact panel and required Canada Soccer language', () => {
  const pageSource = readFileSync(
    new URL('../pages/DefensiveTransitionPage.tsx', import.meta.url),
    'utf8',
  )
  const evaluatorCopy = [
    pageSource,
    ...DEFENSIVE_TRANSITION_PAGE_CASES.flatMap((testCase) => [
      testCase.tabLabel,
      testCase.zoneFocus,
      testCase.caption,
      testCase.strategy,
      ...testCase.tactics,
      ...testCase.coachingPoints,
      ...testCase.principles,
      ...testCase.steps.map((step) => step.cue),
    ]),
  ].join(' ')

  ;[
    'Defensive Transition',
    'Zone 1',
    'Zone 2',
    'Zone 3',
    'Zone 4',
    'Channel 1',
    'Channel 2',
    'Channel 3',
    'DENY',
    'DELAY',
    'DIRECT',
    'BALANCE',
    'CONTROL & RESTRAINT',
    'Game plan',
    'Movement sequence',
    'Coaching points',
    'Key tags',
  ].forEach((term) => assert.match(evaluatorCopy, new RegExp(term.replace('&', '\\&'))))

  assert.doesNotMatch(pageSource, /Preview only/)
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
    assert.equal(testCase.tactics.length, 4, `${testCase.id}: four numbered movement steps`)
    assert.ok(testCase.coachingPoints.length >= 2 && testCase.coachingPoints.length <= 3)
    assert.ok(testCase.principles.length > 0 && testCase.principles.length <= 4)
  })
})
