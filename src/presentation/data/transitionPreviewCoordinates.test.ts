/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { PITCH, getZoneNumberForY } from '../../domain/pitch/pitchConstants.ts'
import type { PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview.tsx'
import {
  ATTACKING_TRANSITION_PAGE_CASES,
  getTransitionFacingAngle,
  type AttackingTransitionPageCase,
} from './attackingTransitionPageData.ts'
import { DEFENSIVE_TRANSITION_PAGE_CASES } from './defensiveTransitionPageData.ts'
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

function assertVisibleDefensiveTurnover(
  step: PixiPitchPreviewStep,
  initialBall: PreviewPoint,
  caseId: string,
): void {
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

test('every DT tab starts with the ball in its labelled canonical zone', () => {
  DEFENSIVE_TRANSITION_PAGE_CASES.forEach((testCase) => {
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
    assertVisibleDefensiveTurnover(firstStep, testCase.ballPosition, testCase.id)
    assert.ok(testCase.routes.some((route) => route.revealOnStepId === firstStep.id))
  })
})

test('Page 13 retains one attacking-transition case for each of the four zones', () => {
  assert.deepEqual(
    ATTACKING_TRANSITION_PAGE_CASES.map((scenario) => scenario.id),
    ['zone-1', 'zone-2', 'zone-3', 'zone-4'],
  )
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
    'zone-1': 5.48,
    'zone-2': 5.22,
    'zone-3': 5.04,
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
