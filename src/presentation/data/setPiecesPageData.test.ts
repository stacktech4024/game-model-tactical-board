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

test('Set Pieces exposes the four required restart examples in presentation order', () => {
  assert.deepEqual(
    SET_PIECES_PAGE_CASES.map((item) => [item.id, item.tabLabel]),
    [
      ['attacking-corner', 'Attacking Corner'],
      ['defending-corner', 'Defending Corner'],
      ['wide-free-kick', 'Wide Free Kick'],
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
  assert.match(corner.organization, /#4\/#5\/#9\/#10\/#11.*#8.*#2\/#6.*hybrid/i)
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
  assert.match(getCase('wide-free-kick').strategy, /crossing angle.*compact line.*hybrid defence/i)
  assert.match(getCase('throw-in').strategy, /free receiving option.*secure reset/i)
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

test('attacking corner uses a connected cluster, staggered manipulation, targeted contact, and secure second phase', () => {
  const corner = getCase('attacking-corner')
  const clusterIds = ['ac-home-4', 'ac-home-5', 'ac-home-9', 'ac-home-10', 'ac-home-11']
  const cluster = clusterIds.map((id) => getPlayer(corner, id))
  const clusterXs = cluster.map((player) => player.x).sort((a, b) => a - b)
  const clusterYs = cluster.map((player) => player.y)

  assert.ok(corner.preview.ballPosition.x <= 2 && corner.preview.ballPosition.y <= 2, 'ball must start in the corner arc')
  assert.ok(Math.max(...clusterYs) - Math.min(...clusterYs) <= 1, 'main attackers must share a connected starting height')
  assert.ok(
    clusterXs.slice(1).every((x, index) => x - clusterXs[index] <= 5),
    'main attackers must begin in a recognizable cluster',
  )

  const manipulation = corner.preview.steps.find((step) => step.id === 'ac-manipulation')
  const delivery = corner.preview.steps.find((step) => step.id === 'ac-delivery')
  const attackingRuns = delivery?.playerMoves?.filter((move) => clusterIds.includes(move.playerId)) ?? []
  const primaryRun = attackingRuns.find((move) => move.playerId === 'ac-home-9')

  assert.ok(manipulation?.playerMoves?.some((move) => move.playerId === 'ac-home-4'))
  assert.ok(manipulation?.playerMoves?.some((move) => move.playerId === 'ac-home-10'))
  assert.equal(attackingRuns.length, 5)
  assert.equal(new Set(attackingRuns.map((move) => move.startDelay ?? 0)).size, 5)
  assert.deepEqual(delivery?.ballTo, primaryRun?.to, 'changed-angle delivery must target the primary #9 run')

  const secondBall = corner.preview.steps.find((step) => step.id === 'ac-second-ball')

  assert.equal(secondBall?.emphasizePlayerId, 'ac-home-8')
  assert.equal(secondBall?.playerId, 'ac-home-6')
  assert.ok(getPlayer(corner, 'ac-home-2').y >= 57)
  assert.ok(getPlayer(corner, 'ac-home-6').y >= 57)
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

test('wide free kick has a connected setup, hybrid defence, staggered runs, and a selected target', () => {
  const wideFreeKick = getCase('wide-free-kick')
  const attackingLineIds = ['wf-home-4', 'wf-home-5', 'wf-home-9', 'wf-home-10', 'wf-home-11']
  const linePlayers = attackingLineIds.map((id) => getPlayer(wideFreeKick, id))
  const lineHeights = linePlayers.map((player) => player.y)
  const lineXs = linePlayers.map((player) => player.x).sort((a, b) => a - b)

  assert.ok(Math.max(...lineHeights) - Math.min(...lineHeights) <= 2, 'attacking line must share a starting height')
  assert.ok(
    lineXs.slice(1).every((x, index) => x - lineXs[index] <= 7),
    'attacking line must begin connected rather than scattered',
  )
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
  const primaryRun = attackingRuns.find((move) => move.playerId === 'wf-home-9')

  assert.equal(attackingRuns.length, 5, 'all five connected attackers must release on delivery')
  assert.equal(new Set(delays).size, attackingRuns.length, 'attacking runs must use staggered timing')
  assert.deepEqual(delivery?.ballTo, primaryRun?.to, 'delivery must target #9 rather than the nearest player')
})

test('wide free-kick runners are onside at delivery and retain second-ball/rest-defence roles', () => {
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

  const secondBall = wideFreeKick.preview.steps.find((step) => step.id === 'wf-second-ball')

  assert.equal(secondBall?.emphasizePlayerId, 'wf-home-8')
  assert.equal(secondBall?.playerId, 'wf-home-6')
  assert.match(secondBall?.cue ?? '', /#8.*#6.*#2\/#3.*rest defence/i)
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

  assert.match(pageSource, /role="tablist"/)
  assert.match(pageSource, /role="tab"/)
  assert.match(pageSource, /aria-selected=/)
  assert.match(pageSource, /selectCase\(item\.id\)/)
  assert.match(pageSource, /key=\{activeCase\.id\}/)
  assert.match(pageSource, /System \/ Organization/)
  assert.doesNotMatch(pageSource, /Not authored yet/)
})
