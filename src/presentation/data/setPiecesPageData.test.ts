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
  assert.match(corner.organization, /#9.*#8\/#10.*#2\/#4\/#5\/#6/)
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
  assert.match(getCase('wide-free-kick').strategy, /delivery trigger.*staggered runs/i)
  assert.match(getCase('throw-in').strategy, /three passing angles.*without forcing a long throw/i)
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
