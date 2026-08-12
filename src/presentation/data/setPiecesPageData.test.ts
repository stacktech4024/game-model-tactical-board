/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { SCENARIOS } from '../../data/scenarios.ts'
import { CORNER_PREVIEW_STEPS } from './cornerScenario.ts'
import {
  SET_PIECES_PAGE_CASES,
  type SetPiecePageCase,
} from './setPiecesPageData.ts'

function getCase(id: SetPiecePageCase['id']): SetPiecePageCase {
  const setPieceCase = SET_PIECES_PAGE_CASES.find((item) => item.id === id)

  assert.ok(setPieceCase, `missing set-piece case ${id}`)
  return setPieceCase
}

function getPlayer(setPieceCase: SetPiecePageCase, id: string) {
  const player = setPieceCase.preview.players.find((item) => item.id === id)

  assert.ok(player, `${setPieceCase.id}: missing player ${id}`)
  return player
}

function replayUntil(
  setPieceCase: SetPiecePageCase,
  stopBeforeStepId?: string,
) {
  const positions = new Map(
    setPieceCase.preview.players.map((player) => [player.id, { x: player.x, y: player.y }]),
  )
  let ball = { ...setPieceCase.preview.ballPosition }

  for (const step of setPieceCase.preview.steps) {
    if (step.id === stopBeforeStepId) {
      break
    }

    if (step.ballFrom) {
      assert.deepEqual(step.ballFrom, ball, `${setPieceCase.id}/${step.id}: replay ball continuity`)
      assert.ok(step.ballTo)
      ball = { ...step.ballTo }
    }

    if (step.playerId && step.playerTo) {
      positions.set(step.playerId, { ...step.playerTo })
    }

    step.playerMoves?.forEach((move) => positions.set(move.playerId, { ...move.to }))
  }

  return { positions, ball }
}

function distanceInMetres(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  const xMetres = ((first.x - second.x) * 68) / 100
  const yMetres = ((first.y - second.y) * 105) / 100

  return Math.hypot(xMetres, yMetres)
}

function assertAttackersOnsideAtTouch(
  setPieceCase: SetPiecePageCase,
  state: ReturnType<typeof replayUntil>,
  attackerIds: string[],
) {
  const defenderGoalLineDistances = setPieceCase.preview.players
    .filter((player) => player.side === 'away')
    .map((player) => state.positions.get(player.id)?.y)
    .filter((y): y is number => y !== undefined)
    .sort((first, second) => first - second)
  const secondLastDefenderY = defenderGoalLineDistances[1]

  assert.ok(secondLastDefenderY !== undefined, `${setPieceCase.id}: second-last defender`)
  const offsideLineY = Math.min(state.ball.y, secondLastDefenderY)

  attackerIds.forEach((attackerId) => {
    const attacker = state.positions.get(attackerId)

    assert.ok(attacker, `${setPieceCase.id}: missing attacker ${attackerId}`)
    assert.ok(
      attacker.y >= offsideLineY,
      `${setPieceCase.id}/${attackerId}: must be onside when the ball is touched`,
    )
  })
}

function facingAngleFromMovement(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  return (Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI
}

function facingDifference(first: number, second: number) {
  return Math.abs(((first - second + 540) % 360) - 180)
}

function assertMovementFacing(
  setPieceCase: SetPiecePageCase,
  stepId: string,
  playerId: string,
  tolerance = 2,
) {
  const step = setPieceCase.preview.steps.find((item) => item.id === stepId)
  const move = step?.playerMoves?.find((item) => item.playerId === playerId)
  const start = replayUntil(setPieceCase, stepId).positions.get(playerId)

  assert.ok(step, `${setPieceCase.id}: missing step ${stepId}`)
  assert.ok(move, `${setPieceCase.id}/${stepId}: missing movement for ${playerId}`)
  assert.ok(start, `${setPieceCase.id}/${stepId}: missing start position for ${playerId}`)
  assert.ok(Number.isFinite(move.facingAngle), `${setPieceCase.id}/${stepId}: missing facing for ${playerId}`)
  assert.ok(
    facingDifference(move.facingAngle!, facingAngleFromMovement(start, move.to)) <= tolerance,
    `${setPieceCase.id}/${stepId}/${playerId}: body must follow the movement path`,
  )
}

test('Set Pieces exposes the complete restart menu in presentation order', () => {
  assert.deepEqual(
    SET_PIECES_PAGE_CASES.map((item) => [item.id, item.tabLabel]),
    [
      ['attacking-corner', 'Attacking Corner'],
      ['defending-corner', 'Defending Corner'],
      ['wide-free-kick', 'Wide Free Kick'],
      ['direct-free-kick', 'Direct Free Kick'],
      ['indirect-free-kick', 'Indirect Free Kick'],
      ['throw-in', 'Throw-In'],
    ],
  )
})

test('the attacking corner remains the established deep animated example with a valid live-board scenario', () => {
  const corner = getCase('attacking-corner')

  assert.equal(corner.implementation, 'Full animation')
  assert.deepEqual(corner.preview.steps, CORNER_PREVIEW_STEPS)
  assert.equal(corner.liveBoardScenarioId, 'corner-short-decoy-wide-delivery')
  assert.ok(SCENARIOS.some((scenario) => scenario.id === corner.liveBoardScenarioId))
  assert.match(corner.organization, /#4\/#5\/#9\/#10\/#11.*#2.*first contact.*#8.*penalty-spot.*#6.*transition.*hybrid/i)
})

test('every restart distinguishes organization, strategy, tactics, skills, principles, and professional-game context', () => {
  SET_PIECES_PAGE_CASES.forEach((setPieceCase) => {
    assert.ok(setPieceCase.organization.length >= 80, `${setPieceCase.id}: organization`)
    assert.ok(setPieceCase.strategy.length >= 70, `${setPieceCase.id}: strategy`)
    assert.equal(setPieceCase.tactics.length, 4, `${setPieceCase.id}: four tactics`)
    assert.ok(setPieceCase.skillSet.length >= 5, `${setPieceCase.id}: skill set`)
    assert.ok(setPieceCase.principles.length >= 3, `${setPieceCase.id}: principles`)
    assert.ok(setPieceCase.realityReference.length >= 100, `${setPieceCase.id}: reality reference`)
  })

  assert.match(getCase('defending-corner').strategy, /first contact.*second ball.*transition/i)
  assert.match(getCase('wide-free-kick').strategy, /crossing angle.*#11.*hybrid defence/i)
  assert.match(getCase('direct-free-kick').strategy, /disguise.*roll.*strike/i)
  assert.match(getCase('indirect-free-kick').strategy, /false cues.*roll.*second touch/i)
  assert.match(getCase('throw-in').strategy, /free receiving option.*secure reset/i)
})

test('direct free kick keeps rebound runners onside and uses realistic rest defence', () => {
  const direct = getCase('direct-free-kick')
  const roll = direct.preview.steps.find((step) => step.id === 'df-roll')
  const strike = direct.preview.steps.find((step) => step.id === 'df-strike')
  const atFirstTouch = replayUntil(direct, 'df-roll')
  const atRoll = replayUntil(direct, 'df-roll')
  const atStrike = replayUntil(direct, 'df-strike')
  const wall = ['df-away-4', 'df-away-5', 'df-away-6', 'df-away-8'].map((id) => getPlayer(direct, id))

  assert.deepEqual(roll?.ballFrom, direct.preview.ballPosition)
  assert.deepEqual(strike?.ballFrom, roll?.ballTo)
  assert.equal(strike?.ballTo?.y, 0.5)
  assert.equal(strike?.emphasizePlayerId, 'df-home-10')
  assert.ok(distanceInMetres(atRoll.positions.get('df-home-7')!, roll!.ballFrom!) <= 2)
  assert.ok(distanceInMetres(atStrike.positions.get('df-home-10')!, strike!.ballFrom!) <= 2.1)
  wall.forEach((defender) => {
    assert.ok(distanceInMetres(defender, direct.preview.ballPosition) >= 9.15, `${defender.id}: wall distance`)
    assert.ok(distanceInMetres(defender, getPlayer(direct, 'df-home-6')) >= 1, `${defender.id}: legal #6 screen distance`)
  })
  assertAttackersOnsideAtTouch(direct, atFirstTouch, ['df-home-9', 'df-home-11'])
  assertAttackersOnsideAtTouch(direct, atStrike, ['df-home-6', 'df-home-9', 'df-home-11'])
  ;['df-home-2', 'df-home-3'].forEach((id) => {
    assert.ok(getPlayer(direct, id).y < 35, `${id}: wide rebound-support lane`)
  })
  ;['df-home-4', 'df-home-5'].forEach((id) => {
    assert.ok(getPlayer(direct, id).y >= 50 && getPlayer(direct, id).y <= 65, `${id}: near-halfway rest defence`)
    assert.ok(strike?.playerMoves?.some((move) => move.playerId === id), `${id}: rest-defence adjustment`)
  })
  assert.ok(Math.abs(getPlayer(direct, 'df-home-4').y - getPlayer(direct, 'df-home-5').y) >= 3, 'direct: #4/#5 stagger')
  assert.ok(getPlayer(direct, 'df-away-9').y >= 45, 'direct: defending #9 remains a high outlet')
  assert.ok(getPlayer(direct, 'df-away-10').y >= 45, 'direct: defending #10 remains a high outlet')
  assert.ok(getPlayer(direct, 'df-home-4').y > getPlayer(direct, 'df-away-9').y, 'direct: #4 stays goal-side of #9')
  assert.ok(getPlayer(direct, 'df-home-5').y > getPlayer(direct, 'df-away-10').y, 'direct: #5 stays goal-side of #10')
  assert.match(direct.realityReference, /Elite-match principle.*onside.*one metre/i)
})

test('indirect free kick uses a legal screen, mandatory first touch, active wall, and second-player finish', () => {
  const indirect = getCase('indirect-free-kick')
  const dummies = indirect.preview.steps.find((step) => step.id === 'if-dummies')
  const release = indirect.preview.steps.find((step) => step.id === 'if-screen-release')
  const roll = indirect.preview.steps.find((step) => step.id === 'if-roll')
  const strike = indirect.preview.steps.find((step) => step.id === 'if-strike')
  const atRoll = replayUntil(indirect, 'if-roll')
  const atStrike = replayUntil(indirect, 'if-strike')
  const wallIds = ['if-away-2', 'if-away-3', 'if-away-4', 'if-away-5', 'if-away-6', 'if-away-8']

  assert.ok(dummies?.playerMoves?.some((move) => move.playerId === 'if-home-7'))
  assert.ok(release?.playerMoves?.some((move) => move.playerId === 'if-home-9'))
  assert.ok(release?.playerMoves?.some((move) => move.playerId === 'if-home-11'))
  wallIds.forEach((wallId) => {
    const defender = getPlayer(indirect, wallId)

    ;['if-home-9', 'if-home-11'].forEach((screenId) => {
      assert.ok(
        distanceInMetres(defender, getPlayer(indirect, screenId)) >= 1,
        `${screenId} must remain at least one metre from ${wallId}`,
      )
    })
    assert.ok(roll?.playerMoves?.some((move) => move.playerId === wallId), `${wallId}: reacts after first touch`)
  })
  assert.deepEqual(roll?.ballFrom, indirect.preview.ballPosition)
  assert.deepEqual(strike?.ballFrom, roll?.ballTo)
  assert.equal(strike?.ballTo?.y, 0.4)
  assert.ok(distanceInMetres(atRoll.positions.get('if-home-10')!, roll!.ballFrom!) <= 3)
  assert.ok(distanceInMetres(atStrike.positions.get('if-home-7')!, strike!.ballFrom!) <= 1.5)
  assertAttackersOnsideAtTouch(indirect, atRoll, ['if-home-9', 'if-home-11'])
  assertAttackersOnsideAtTouch(indirect, atStrike, ['if-home-9', 'if-home-11'])
  assert.ok(getPlayer(indirect, 'if-away-9').y >= 45, 'indirect: defending #9 remains a high outlet')
  assert.ok(getPlayer(indirect, 'if-away-10').y >= 45, 'indirect: defending #10 remains a high outlet')
  assert.ok(getPlayer(indirect, 'if-home-4').y > getPlayer(indirect, 'if-away-9').y, 'indirect: #4 stays goal-side of #9')
  assert.ok(getPlayer(indirect, 'if-home-5').y > getPlayer(indirect, 'if-away-10').y, 'indirect: #5 stays goal-side of #10')
  assert.ok(Math.abs(getPlayer(indirect, 'if-home-4').y - getPlayer(indirect, 'if-home-5').y) >= 3, 'indirect: #4/#5 stagger')
  assert.match(indirect.realityReference, /Law-based elite-match principle.*second touch.*one metre/i)
})

test('direct and indirect free-kick copy contains no professional club or player references', () => {
  const copy = ['direct-free-kick', 'indirect-free-kick']
    .map((id) => getCase(id as SetPiecePageCase['id']))
    .flatMap((setPieceCase) => [
      setPieceCase.organization,
      setPieceCase.strategy,
      ...setPieceCase.tactics,
      setPieceCase.caption,
      setPieceCase.realityReference,
    ])
    .join(' ')

  assert.doesNotMatch(copy, /Manchester United|Crystal Palace|Premier League|Fernandes|Mount|Solano|Shearer/i)
})

test('new free-kick ball actions use believable elite-match distances and speeds', () => {
  const direct = getCase('direct-free-kick')
  const indirect = getCase('indirect-free-kick')
  const directRoll = direct.preview.steps.find((step) => step.id === 'df-roll')!
  const directStrike = direct.preview.steps.find((step) => step.id === 'df-strike')!
  const indirectRoll = indirect.preview.steps.find((step) => step.id === 'if-roll')!
  const indirectStrike = indirect.preview.steps.find((step) => step.id === 'if-strike')!

  const speed = (step: typeof directRoll) =>
    distanceInMetres(step.ballFrom!, step.ballTo!) / step.duration

  assert.ok(distanceInMetres(directRoll.ballFrom!, directRoll.ballTo!) >= 1.5)
  assert.ok(distanceInMetres(directRoll.ballFrom!, directRoll.ballTo!) <= 3)
  assert.ok(speed(directRoll) >= 3 && speed(directRoll) <= 10)
  assert.ok(speed(indirectRoll) >= 4 && speed(indirectRoll) <= 12)
  assert.ok(speed(directStrike) >= 25 && speed(directStrike) <= 50)
  assert.ok(speed(indirectStrike) >= 20 && speed(indirectStrike) <= 45)
})

test('new free-kick routines author body orientation for every player and movement', () => {
  ;['direct-free-kick', 'indirect-free-kick'].forEach((caseId) => {
    const freeKick = getCase(caseId as SetPiecePageCase['id'])

    freeKick.preview.players.forEach((player) => {
      assert.ok(Number.isFinite(player.facingAngle), `${caseId}/${player.id}: initial facing`)
    })
    freeKick.preview.steps.forEach((step) => {
      if (step.playerId && step.playerTo) {
        assert.ok(Number.isFinite(step.facingAngle), `${caseId}/${step.id}: primary facing`)
      }
      step.playerMoves?.forEach((move) => {
        assert.ok(Number.isFinite(move.facingAngle), `${caseId}/${step.id}/${move.playerId}: movement facing`)
      })
    })
  })
})

test('free-kick body orientation follows the ball, strike, and defensive charge', () => {
  ;['direct-free-kick', 'indirect-free-kick'].forEach((caseId) => {
    const freeKick = getCase(caseId as SetPiecePageCase['id'])

    freeKick.preview.players.forEach((player) => {
      const expected = facingAngleFromMovement(player, freeKick.preview.ballPosition)

      assert.ok(
        facingDifference(player.facingAngle!, expected) <= 2,
        `${caseId}/${player.id}: setup body must see the ball`,
      )
    })
  })

  const direct = getCase('direct-free-kick')
  const directStrike = direct.preview.steps.find((step) => step.id === 'df-strike')!
  const indirect = getCase('indirect-free-kick')
  const indirectStrike = indirect.preview.steps.find((step) => step.id === 'if-strike')!

  assert.ok(facingDifference(
    directStrike.facingAngle!,
    facingAngleFromMovement(directStrike.ballFrom!, directStrike.ballTo!),
  ) <= 2, 'direct striker must face the shot')
  assert.ok(facingDifference(
    indirectStrike.facingAngle!,
    facingAngleFromMovement(indirectStrike.ballFrom!, indirectStrike.ballTo!),
  ) <= 2, 'indirect striker must face the shot')

  ;['df-away-4', 'df-away-5', 'df-away-6', 'df-away-8'].forEach((playerId) => {
    assertMovementFacing(direct, 'df-roll', playerId)
    assertMovementFacing(direct, 'df-strike', playerId)
  })
  ;['if-away-2', 'if-away-3', 'if-away-4', 'if-away-5', 'if-away-6', 'if-away-8'].forEach((playerId) => {
    assertMovementFacing(indirect, 'if-roll', playerId)
    assertMovementFacing(indirect, 'if-strike', playerId)
  })
})

test('new free-kick routines keep every player token separated through every authored frame', () => {
  ;['direct-free-kick', 'indirect-free-kick'].forEach((caseId) => {
    const freeKick = getCase(caseId as SetPiecePageCase['id'])

    for (let stopIndex = 0; stopIndex <= freeKick.preview.steps.length; stopIndex += 1) {
      const stopId = freeKick.preview.steps[stopIndex]?.id
      const frame = replayUntil(freeKick, stopId)
      const positions = [...frame.positions.entries()]

      positions.forEach(([firstId, first], firstIndex) => {
        positions.slice(firstIndex + 1).forEach(([secondId, second]) => {
          assert.ok(
            distanceInMetres(first, second) >= 0.65,
            `${caseId}/${stopId ?? 'final'}: ${firstId} and ${secondId} must not overlap`,
          )
        })
      })
    }
  })
})

test('throw-in begins in a legal state with four support relationships and tracked opposition', () => {
  const throwIn = getCase('throw-in')
  const thrower = getPlayer(throwIn, 'ti-home-2')
  const firstBallAction = throwIn.preview.steps.find((step) => step.id === 'ti-throw-short')
  const coordinatedMovement = throwIn.preview.steps.find((step) => step.id === 'ti-coordinated-movement')

  assert.ok(thrower.x > 100, 'thrower must start outside the right touchline')
  assert.equal(thrower.facingAngle, -90, 'thrower must face into the field')
  assert.ok(throwIn.preview.ballPosition.x >= 100, 'ball must start outside/on the touchline')
  assert.ok(
    distanceInMetres(thrower, throwIn.preview.ballPosition) <= 2,
    'ball must begin with the thrower',
  )
  assert.deepEqual(firstBallAction?.ballFrom, throwIn.preview.ballPosition)
  assert.ok((firstBallAction?.ballTo?.x ?? 101) < 100, 'ball must enter the field on the throw')

  const supportIds = ['ti-home-7', 'ti-home-10', 'ti-home-9', 'ti-home-6']
  supportIds.forEach((id) => assert.ok(getPlayer(throwIn, id)))
  assert.ok(
    supportIds.every((id) => coordinatedMovement?.playerMoves?.some((move) => move.playerId === id)),
    'short, inside, beyond, and reset players must all move after setup',
  )
  assert.ok(
    throwIn.preview.players
      .filter((player) => player.side === 'away' || player.tone === 'opponent')
      .every((player) => distanceInMetres(player, throwIn.preview.ballPosition) >= 2),
    'opponents must respect the two-metre throw-in distance',
  )

  const initialState = JSON.stringify({
    players: throwIn.preview.players,
    ballPosition: throwIn.preview.ballPosition,
  })

  replayUntil(throwIn)

  assert.equal(
    JSON.stringify({ players: throwIn.preview.players, ballPosition: throwIn.preview.ballPosition }),
    initialState,
    'deterministic replay must not mutate the legal reset state',
  )
  assert.ok(getPlayer(throwIn, 'ti-home-2').x > 100, 'reset must restore the legal thrower position')
})

test('attacking corner keeps its connected cluster before #2 heads the far-post delivery across for #8 to finish', () => {
  const corner = getCase('attacking-corner')
  const clusterIds = ['ac-home-4', 'ac-home-5', 'ac-home-9', 'ac-home-10', 'ac-home-11']
  const cluster = clusterIds.map((id) => getPlayer(corner, id))
  const clusterXs = cluster.map((player) => player.x).sort((a, b) => a - b)
  const clusterYs = cluster.map((player) => player.y)

  assert.ok(corner.preview.ballPosition.x <= 2 && corner.preview.ballPosition.y <= 2, 'ball must start in the corner arc')
  assert.ok(Math.max(...clusterYs) - Math.min(...clusterYs) <= 1, 'main attackers must share a connected starting height')
  assert.ok(
    clusterXs.slice(1).every((x, index) => {
      const gap = x - clusterXs[index]

      return gap >= 5.5 && gap <= 6.5
    }),
    'main attackers must begin connected but visually separated',
  )

  const manipulation = corner.preview.steps.find((step) => step.id === 'ac-manipulation')
  const delivery = corner.preview.steps.find((step) => step.id === 'ac-delivery')
  const attackingRuns = delivery?.playerMoves?.filter((move) => clusterIds.includes(move.playerId)) ?? []
  const backPostRun = delivery?.playerMoves?.find((move) => move.playerId === 'ac-home-2')
  const atDelivery = replayUntil(corner, 'ac-delivery')

  assert.ok(manipulation?.playerMoves?.some((move) => move.playerId === 'ac-home-4'))
  assert.ok(manipulation?.playerMoves?.some((move) => move.playerId === 'ac-home-10'))
  assert.equal(attackingRuns.length, 5)
  assert.equal(new Set(attackingRuns.map((move) => move.startDelay ?? 0)).size, 5)
  attackingRuns.forEach((move) => {
    const start = atDelivery.positions.get(move.playerId)

    assert.ok(start)
    assert.ok(move.to.x < start.x && move.to.y < start.y, `${move.playerId} must run diagonally in from the far side`)
  })
  assert.ok(backPostRun, '#2 must attack the far-post delivery after beginning beyond the cluster')
  assert.deepEqual(delivery?.ballTo, backPostRun?.to, 'changed-angle delivery must reach #2 at the far post')
  assert.ok((delivery?.ballTo?.x ?? 0) >= 70, 'delivery must travel wide beyond the central crowd')
  const centralPin = delivery?.playerMoves?.find((move) => move.playerId === 'ac-home-9')
  assert.ok((delivery?.ballTo?.y ?? 100) <= (centralPin?.to.y ?? 0), '#2 must receive at least as deep as #9')

  const deliveryIndex = corner.preview.steps.findIndex((step) => step.id === 'ac-delivery')
  const headerAcross = corner.preview.steps.find((step) => step.id === 'ac-header-across')
  const finish = corner.preview.steps.find((step) => step.id === 'ac-finish')

  assert.deepEqual(headerAcross?.ballFrom, delivery?.ballTo)
  assert.equal(headerAcross?.emphasizePlayerId, 'ac-home-2')
  assert.ok(headerAcross?.playerMoves?.some((move) => move.playerId === 'ac-home-2'))
  assert.ok(headerAcross?.playerMoves?.some((move) => move.playerId === 'ac-away-2'))
  assert.ok(headerAcross?.playerMoves?.some((move) => move.playerId === 'ac-home-8'))
  assert.ok((headerAcross?.ballTo?.x ?? 0) >= 47 && (headerAcross?.ballTo?.x ?? 100) <= 53)
  assert.ok((headerAcross?.ballTo?.y ?? 0) >= 9 && (headerAcross?.ballTo?.y ?? 100) <= 13)
  assert.ok(
    (headerAcross?.ballTo?.y ?? 0) > (headerAcross?.ballFrom?.y ?? 100),
    '#2 header must travel back away from the goal line toward the penalty spot',
  )
  assert.equal(finish?.emphasizePlayerId, 'ac-home-8')
  assert.deepEqual(finish?.ballFrom, headerAcross?.ballTo)
  assert.equal(finish?.ballTo?.y, 0)
  assert.match(finish?.cue ?? '', /#8.*heads.*goal/i)
  assert.ok(finish?.playerMoves?.some((move) => move.playerId === 'ac-home-8'))
  assert.ok(corner.preview.steps.indexOf(headerAcross!) > deliveryIndex)
  assert.ok(corner.preview.steps.indexOf(finish!) > corner.preview.steps.indexOf(headerAcross!))
  assert.ok(getPlayer(corner, 'ac-home-2').x >= 85 && getPlayer(corner, 'ac-home-2').y < 42)
  assert.ok(getPlayer(corner, 'ac-home-6').y >= 57)
  assert.match(corner.strategy, /#2.*head back.*penalty spot.*#8.*second header/i)
})

test('attacking-corner finishers and rest defence never turn their backs on the live action', () => {
  const corner = getCase('attacking-corner')
  const finish = corner.preview.steps.find((step) => step.id === 'ac-finish')!
  const eightFinish = finish.playerMoves?.find((move) => move.playerId === 'ac-home-8')

  assertMovementFacing(corner, 'ac-header-across', 'ac-home-8')
  assertMovementFacing(corner, 'ac-header-across', 'ac-home-9')
  assertMovementFacing(corner, 'ac-finish', 'ac-home-6')
  assert.ok(eightFinish)
  assert.ok(facingDifference(
    eightFinish.facingAngle!,
    facingAngleFromMovement(finish.ballFrom!, finish.ballTo!),
  ) <= 2, '#8 must face the headed finish')
})

test('set-piece presentation uses a centred professional card grid and an explicit team key', () => {
  const pageSource = readFileSync(new URL('../pages/SetPiecesPage.tsx', import.meta.url), 'utf8')
  const layoutCss = readFileSync(new URL('../PresentationLayout.css', import.meta.url), 'utf8')

  assert.match(pageSource, /set-pieces-team-key[\s\S]*Pickering[\s\S]*Opponent[\s\S]*Pickering attacks/)
  assert.match(layoutCss, /set-pieces-skills \.presentation-chip-row[\s\S]*repeat\(5, minmax\(0, 1fr\)\)/)
  assert.match(layoutCss, /set-pieces-principles \.presentation-chip-row[\s\S]*repeat\(5, minmax\(0, 1fr\)\)/)
  assert.match(layoutCss, /set-pieces-skills \.presentation-chip,[\s\S]*place-items: center;[\s\S]*text-align: center;/)
})

test('defending corner uses a hybrid block with active goalkeeper, first contact, edge cover, and outlet', () => {
  const corner = getCase('defending-corner')
  const attackingClusterIds = ['dc-away-4', 'dc-away-5', 'dc-away-9', 'dc-away-10', 'dc-away-11']
  const attackingCluster = attackingClusterIds.map((id) => getPlayer(corner, id))
  const zonalIds = ['dc-home-4', 'dc-home-5', 'dc-home-6', 'dc-home-2']
  const zonalPlayers = zonalIds.map((id) => getPlayer(corner, id))

  assert.ok(corner.preview.ballPosition.x >= 98 && corner.preview.ballPosition.y >= 98, 'opposition ball must start in the corner arc')
  assert.match(corner.organization, /hybrid defence.*priority.*track.*edge.*outlet/i)
  assert.ok(
    Math.max(...attackingCluster.map((player) => player.y)) - Math.min(...attackingCluster.map((player) => player.y)) <= 1,
    'opposition attackers must begin in a recognizable cluster',
  )
  assert.ok(
    Math.max(...zonalPlayers.map((player) => player.y)) - Math.min(...zonalPlayers.map((player) => player.y)) <= 2,
    'Pickering zonal defenders must protect one coordinated six-yard line',
  )
  ;['dc-home-3', 'dc-home-8', 'dc-home-10'].forEach((id) => assert.ok(getPlayer(corner, id)))

  const setStep = corner.preview.steps.find((step) => step.id === 'dc-set')
  const delivery = corner.preview.steps.find((step) => step.id === 'dc-delivery')
  const firstContact = corner.preview.steps.find((step) => step.id === 'dc-first-contact')
  const secondBall = corner.preview.steps.find((step) => step.id === 'dc-second-ball')
  const opponentRuns = delivery?.playerMoves?.filter((move) => attackingClusterIds.includes(move.playerId)) ?? []

  assert.equal(setStep?.emphasizePlayerId, 'dc-home-1')
  assert.ok(delivery?.playerMoves?.some((move) => move.playerId === 'dc-home-1'), 'goalkeeper must adjust to delivery')
  assert.equal(opponentRuns.length, 5)
  assert.equal(new Set(opponentRuns.map((move) => move.startDelay ?? 0)).size, 5)
  assert.equal(firstContact?.emphasizePlayerId, 'dc-home-5')
  assert.equal(secondBall?.emphasizePlayerId, 'dc-home-11')
  assert.equal(secondBall?.playerId, 'dc-home-9')
})

test('wide free kick has a staggered setup, hybrid defence, distinct runs, and a far-post target', () => {
  const wideFreeKick = getCase('wide-free-kick')
  const attackingLineIds = ['wf-home-4', 'wf-home-5', 'wf-home-9', 'wf-home-10', 'wf-home-11']
  const linePlayers = attackingLineIds.map((id) => getPlayer(wideFreeKick, id))
  const lineHeights = linePlayers.map((player) => player.y)
  const lineXs = linePlayers.map((player) => player.x).sort((a, b) => a - b)

  assert.ok(Math.max(...lineHeights) - Math.min(...lineHeights) >= 5, 'attacking roles must begin at staggered heights')
  assert.ok(
    lineXs.slice(1).every((x, index) => x - lineXs[index] <= 10),
    'attacking roles must remain connected across the width',
  )
  assert.ok(wideFreeKick.preview.ballPosition.x >= 85, 'delivery must start on the right side')
  assert.ok(Math.min(...lineXs) <= 32 && Math.max(...lineXs) >= 65, 'attacking roles must stagger from the far side through the central lane')
  assert.match(wideFreeKick.organization, /hybrid.*priority-space zones.*matched aerial threats/i)

  const zonalLine = ['wf-away-2', 'wf-away-4', 'wf-away-5', 'wf-away-11']
    .map((id) => getPlayer(wideFreeKick, id))
  assert.ok(
    Math.max(...zonalLine.map((player) => player.y)) - Math.min(...zonalLine.map((player) => player.y)) <= 2,
    'hybrid defence must contain a coordinated zonal line',
  )
  ;['wf-away-3', 'wf-away-6', 'wf-away-10', 'wf-away-7', 'wf-away-8']
    .forEach((id) => assert.ok(getPlayer(wideFreeKick, id)))

  const delivery = wideFreeKick.preview.steps.find((step) => step.id === 'wf-delivery')
  const attackingRuns = delivery?.playerMoves?.filter((move) => attackingLineIds.includes(move.playerId)) ?? []
  const delays = attackingRuns.map((move) => move.startDelay ?? 0)
  const primaryRun = attackingRuns.find((move) => move.playerId === 'wf-home-11')
  const atDelivery = replayUntil(wideFreeKick, 'wf-delivery')

  assert.equal(attackingRuns.length, 5, 'all five connected attackers must release on delivery')
  assert.equal(new Set(delays).size, attackingRuns.length, 'attacking runs must use staggered timing')
  attackingRuns.forEach((move) => {
    const start = atDelivery.positions.get(move.playerId)

    assert.ok(start)
    assert.ok(move.to.y < start.y, `${move.playerId} must attack goal on the service`)
  })
  assert.deepEqual(delivery?.ballTo, primaryRun?.to, 'delivery must target #11 at the far post')
})

test('wide free-kick runners are onside at delivery and finish the far-post return', () => {
  const wideFreeKick = getCase('wide-free-kick')
  const atDelivery = replayUntil(wideFreeKick, 'wf-delivery')
  const opponentYs = wideFreeKick.preview.players
    .filter((player) => player.side === 'away' || player.tone === 'opponent')
    .map((player) => atDelivery.positions.get(player.id)?.y)
    .filter((y): y is number => y !== undefined)
    .sort((a, b) => a - b)
  const offsideLine = opponentYs[1]

  assert.ok(offsideLine !== undefined)
  ;['wf-home-4', 'wf-home-5', 'wf-home-9', 'wf-home-10', 'wf-home-11'].forEach((id) => {
    const runner = atDelivery.positions.get(id)

    assert.ok(runner)
    assert.ok(runner.y >= offsideLine, `${id} must be onside when #7 kicks the ball`)
  })

  const delivery = wideFreeKick.preview.steps.find((step) => step.id === 'wf-delivery')
  const deliveryIndex = wideFreeKick.preview.steps.findIndex((step) => step.id === 'wf-delivery')
  const headerBack = wideFreeKick.preview.steps.find((step) => step.id === 'wf-header-back')
  const finish = wideFreeKick.preview.steps.find((step) => step.id === 'wf-finish')

  assert.deepEqual(headerBack?.ballFrom, delivery?.ballTo)
  assert.equal(headerBack?.emphasizePlayerId, 'wf-home-11')
  assert.ok(headerBack?.playerMoves?.some((move) => move.playerId === 'wf-home-9'))
  assert.ok(headerBack?.playerMoves?.some((move) => move.playerId === 'wf-away-6'))
  assert.deepEqual(finish?.ballFrom, headerBack?.ballTo)
  assert.deepEqual(finish?.ballTo, { x: 50, y: 0 })
  assert.equal(finish?.emphasizePlayerId, 'wf-home-9')
  assert.match(finish?.cue ?? '', /shoots.*goal/i)
  ;['wf-home-2', 'wf-home-3'].forEach((id) => {
    assert.ok(finish?.playerMoves?.some((move) => move.playerId === id))
  })
  assert.ok(wideFreeKick.preview.steps.indexOf(headerBack!) > deliveryIndex)
  assert.ok(wideFreeKick.preview.steps.indexOf(finish!) > wideFreeKick.preview.steps.indexOf(headerBack!))
  ;['wf-home-2', 'wf-home-3', 'wf-home-6'].forEach((id) => {
    assert.ok(getPlayer(wideFreeKick, id).y >= 55, `${id} must begin behind the attacking group`)
  })

  assert.deepEqual(replayUntil(wideFreeKick), replayUntil(wideFreeKick), 'animation replay must be deterministic')
})

test('every restart has Pickering roles 1–11 plus believable opposition context', () => {
  const expectedLabels = Array.from({ length: 11 }, (_, index) => String(index + 1))

  SET_PIECES_PAGE_CASES.forEach((setPieceCase) => {
    const homeLabels = setPieceCase.preview.players
      .filter((player) => player.side !== 'away' && player.tone !== 'opponent')
      .map((player) => player.label)
      .sort((a, b) => Number(a) - Number(b))
    const opponents = setPieceCase.preview.players.filter((player) => (
      player.side === 'away' || player.tone === 'opponent'
    ))

    assert.deepEqual(homeLabels, expectedLabels, `${setPieceCase.id}: Pickering #1–#11`)
    assert.ok(opponents.length >= 6, `${setPieceCase.id}: opposition context`)
  })
})

test('short restart sequences keep ball continuity, trackable players, and phase-linked routes', () => {
  SET_PIECES_PAGE_CASES.forEach((setPieceCase) => {
    const positions = new Map(setPieceCase.preview.players.map((player) => [player.id, { x: player.x, y: player.y }]))
    let ball = setPieceCase.preview.ballPosition
    const stepIds = new Set(setPieceCase.preview.steps.map((step) => step.id))

    setPieceCase.preview.steps.forEach((step) => {
      if (step.ballFrom) {
        assert.deepEqual(step.ballFrom, ball, `${setPieceCase.id}/${step.id}: continuous ball chain`)
        assert.ok(step.ballTo)
        ball = step.ballTo
      }

      const movements = [
        ...(step.playerId && step.playerTo ? [{ playerId: step.playerId, to: step.playerTo }] : []),
        ...(step.playerMoves ?? []),
      ]

      movements.forEach((movement) => {
        const from = positions.get(movement.playerId)

        assert.ok(from, `${setPieceCase.id}/${step.id}: known player ${movement.playerId}`)
        assert.ok(
          Math.hypot(from.x - movement.to.x, from.y - movement.to.y) <= 26,
          `${setPieceCase.id}/${step.id}: ${movement.playerId} movement is trackable`,
        )
        positions.set(movement.playerId, movement.to)
      })
    })

    setPieceCase.preview.routes.forEach((route) => {
      assert.ok(!route.revealOnStepId || stepIds.has(route.revealOnStepId), `${setPieceCase.id}: route ${route.id}`)
    })
  })
})

test('the page provides an accessible selector and remounts the preview to prevent stale animation state', () => {
  const pageSource = readFileSync(new URL('../pages/SetPiecesPage.tsx', import.meta.url), 'utf8')
  const freeKickPageSource = readFileSync(new URL('../pages/FreeKicksPage.tsx', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8')
  const layoutStyles = readFileSync(new URL('../PresentationLayout.css', import.meta.url), 'utf8')

  assert.match(pageSource, /role="tablist"/)
  assert.match(pageSource, /role="tab"/)
  assert.match(pageSource, /aria-selected=/)
  assert.match(pageSource, /selectCase\(item\.id\)/)
  assert.match(pageSource, /key=\{activeCase\.id\}/)
  assert.match(pageSource, /System \/ Organization/)
  assert.doesNotMatch(pageSource, /Not authored yet/)
  assert.doesNotMatch(pageSource, /realityReference/)
  assert.match(pageSource, /item\.id !== 'direct-free-kick'.*item\.id !== 'indirect-free-kick'/s)
  assert.match(freeKickPageSource, /item\.id === 'direct-free-kick'.*item\.id === 'indirect-free-kick'/s)
  assert.match(freeKickPageSource, /pageId="free-kicks"/)
  assert.match(appSource, /path="\/presentation\/free-kicks"/)
  assert.match(layoutStyles, /\.set-pieces-lab\s*\{[^}]*minmax\(620px, 0\.9fr\)/s)
  assert.match(layoutStyles, /\.set-pieces-panel\s*\{[^}]*grid-template-columns: repeat\(2/s)
})
