/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { PITCH } from '../../domain/pitch/pitchConstants.ts'
import {
  DEFENSIVE_ORGANIZATION_PAGE_CASE,
  type DefensiveOrganizationPoint,
  type DefensiveOrganizationStep,
} from './defensiveOrganizationPageData.ts'

const scenario = DEFENSIVE_ORGANIZATION_PAGE_CASE

function distance(a: DefensiveOrganizationPoint, b: DefensiveOrganizationPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function stepById(id: string): DefensiveOrganizationStep {
  const step = scenario.steps.find((candidate) => candidate.id === id)

  assert.ok(step, `missing step ${id}`)
  return step
}

function movementFor(step: DefensiveOrganizationStep, playerId: string) {
  if (step.playerId === playerId && step.playerTo) return { playerId, to: step.playerTo, startDelay: 0 }
  return step.playerMoves?.find((move) => move.playerId === playerId)
}

test('the defensive picture contains two recognizable elevens in a 1-4-2-3-1 versus buildup shape', () => {
  const home = scenario.players.filter((player) => player.id.startsWith('home-'))
  const away = scenario.players.filter((player) => player.id.startsWith('away-'))
  const homeById = new Map(home.map((player) => [player.id, player]))

  assert.equal(home.length, 11)
  assert.equal(away.length, 11)
  assert.equal(new Set(scenario.players.map((player) => player.id)).size, 22)
  assert.ok(homeById.get('home-1')!.start.y > 88)
  assert.ok(['home-2', 'home-3', 'home-4', 'home-5'].every((id) => homeById.get(id)!.start.y >= 75))
  assert.ok(['home-6', 'home-8'].every((id) => homeById.get(id)!.start.y >= 56 && homeById.get(id)!.start.y <= 62))
  assert.ok(['home-7', 'home-10', 'home-11'].every((id) => homeById.get(id)!.start.y >= 46 && homeById.get(id)!.start.y <= 50))
  assert.ok(homeById.get('home-9')!.start.y < homeById.get('home-10')!.start.y)
  assert.match(scenario.opponentProblem, /centre-back, pivot, wide receiver, supporting midfielder, and pinning forward/)
})

test('the opponent moves enough roles to make the defending decisions readable', () => {
  const movingOpponents = new Set(
    scenario.steps.flatMap((step) => [
      ...(step.playerId?.startsWith('away-') ? [step.playerId] : []),
      ...(step.playerMoves ?? []).map((move) => move.playerId).filter((id) => id.startsWith('away-')),
    ]),
  )

  assert.deepEqual(
    ['away-2', 'away-5', 'away-6', 'away-7', 'away-8', 'away-9'].every((id) => movingOpponents.has(id)),
    true,
  )
  assert.ok(scenario.players.find((player) => player.id === 'away-7')!.role.includes('Pins'))
  assert.ok(scenario.players.find((player) => player.id === 'away-9')!.role.includes('Pins'))
})

test('the ball chain is continuous from centre-back to pivot to Channel 1 and back to reset', () => {
  const ballSteps = scenario.steps.filter((step) => step.ballFrom)
  let ball = scenario.ballPosition

  assert.deepEqual(ballSteps.map((step) => step.id), [
    'centre-back-to-pivot',
    'direct-channel-one',
    'wide-first-touch',
    'compact-reset',
  ])

  ballSteps.forEach((step) => {
    assert.deepEqual(step.ballFrom, ball, `${step.id}: ball must start at the previous endpoint`)
    assert.ok(step.ballTo)
    ball = step.ballTo
  })

  assert.deepEqual(
    ballSteps.map((step) => [step.ballFromPlayerId, step.ballToPlayerId]),
    [
      ['away-5', 'away-6'],
      ['away-6', 'away-2'],
      ['away-2', 'away-2'],
      ['away-2', 'away-5'],
    ],
  )

  const rightWide = PITCH.CHANNELS.find((channel) => channel.id === 'right-wide')!
  const rightWideStartPercent = (rightWide.startX / PITCH.WIDTH) * 100
  const centralLeft = (PITCH.CHANNELS.find((channel) => channel.id === 'left-central')!.startX / PITCH.WIDTH) * 100
  const centralRight = (PITCH.CHANNELS.find((channel) => channel.id === 'right-central')!.endX / PITCH.WIDTH) * 100

  assert.ok(ballSteps[0].ballTo!.x >= centralLeft && ballSteps[0].ballTo!.x <= centralRight)
  assert.ok(ballSteps[1].ballTo!.x >= rightWideStartPercent)
  assert.equal(ballSteps[2].ballTo!.x, ballSteps[1].ballTo!.x)
  assert.ok(ballSteps[2].ballTo!.y > ballSteps[2].ballFrom!.y)
})

test('#9, #10, #6, and #8 create separate central-denial layers before play goes wide', () => {
  const deny = stepById('deny-central-return')
  const direct = stepById('direct-channel-one')
  const nine = movementFor(deny, 'home-9')!
  const ten = movementFor(deny, 'home-10')!
  const six = movementFor(deny, 'home-6')!
  const eight = movementFor(deny, 'home-8')!

  assert.equal(deny.principle, 'DENY')
  assert.match(deny.cue, /#9 screens.*#10 locks.*#6\/#8 protect Channel 3/)
  assert.ok(nine.to.y < ten.to.y && ten.to.y < eight.to.y && eight.to.y < six.to.y)
  assert.notEqual(six.startDelay, eight.startDelay)
  assert.ok(distance(six.to, eight.to) >= 12)
  assert.ok(scenario.steps.indexOf(deny) < scenario.steps.indexOf(direct))
})

test('#7 delays before pressing and the ball-side/far-side cover arrives in order', () => {
  const receive = stepById('wide-first-touch')
  const pressure = stepById('wide-pressure')
  const cover = stepById('cover-behind-pressure')
  const balance = stepById('far-side-balance')

  assert.equal(receive.principle, 'DELAY')
  assert.ok(movementFor(receive, 'home-7'))
  assert.equal(pressure.playerId, 'home-7')
  assert.ok(movementFor(cover, 'home-2'))
  assert.ok(movementFor(cover, 'home-5'))
  assert.ok(movementFor(cover, 'home-8'))
  assert.ok(movementFor(balance, 'home-4'))
  assert.ok(movementFor(balance, 'home-3'))
  assert.ok(scenario.steps.indexOf(receive) < scenario.steps.indexOf(pressure))
  assert.ok(scenario.steps.indexOf(pressure) < scenario.steps.indexOf(cover))
  assert.ok(scenario.steps.indexOf(cover) < scenario.steps.indexOf(balance))
})

test('all player movements are trackable and delayed actions finish inside their step', () => {
  const positions = new Map(scenario.players.map((player) => [player.id, player.start]))

  scenario.steps.forEach((step) => {
    const movements = [
      ...(step.playerId && step.playerTo ? [{ playerId: step.playerId, to: step.playerTo, startDelay: 0 }] : []),
      ...(step.playerMoves ?? []),
    ]

    movements.forEach((movement) => {
      const from = positions.get(movement.playerId)
      assert.ok(from, `${step.id}: unknown player ${movement.playerId}`)
      assert.ok(distance(from, movement.to) <= 30, `${step.id}: ${movement.playerId} jumps too far`)
      assert.ok((movement.startDelay ?? 0) <= step.duration - 0.16, `${step.id}: ${movement.playerId} starts too late`)
      positions.set(movement.playerId, movement.to)
    })

    if (step.ballTo && step.ballToPlayerId) {
      const receiver = positions.get(step.ballToPlayerId)
      assert.ok(receiver)
      assert.ok(distance(receiver, step.ballTo) <= 2, `${step.id}: ball must finish attached to ${step.ballToPlayerId}`)
    }
  })
})

test('the shifted back line remains ordered, connected, and separated behind pressure', () => {
  const positions = new Map(scenario.players.map((player) => [player.id, player.start]))
  const stopAt = scenario.steps.indexOf(stepById('far-side-balance'))

  scenario.steps.slice(0, stopAt + 1).forEach((step) => {
    if (step.playerId && step.playerTo) positions.set(step.playerId, step.playerTo)
    step.playerMoves?.forEach((move) => positions.set(move.playerId, move.to))
  })

  const line = ['home-3', 'home-4', 'home-5', 'home-2'].map((id) => positions.get(id)!)
  const lineY = line.map((point) => point.y)

  assert.deepEqual(line.map((point) => point.x), [...line.map((point) => point.x)].sort((a, b) => a - b))
  assert.ok(Math.max(...lineY) - Math.min(...lineY) <= 14)
  line.slice(1).forEach((point, index) => assert.ok(distance(line[index], point) >= 14))
  assert.ok(distance(positions.get('home-7')!, positions.get('home-2')!) >= 12)
})

test('the authored game plan has four tactics, five skills, and phase-linked principles', () => {
  assert.equal(scenario.system.shape, '1-4-2-3-1 block')
  assert.match(scenario.strategy, /Protect Zones 1\/2, deny central Channels 2\/3, direct play into Channel 1/)
  assert.match(scenario.system.description, /counter outlet/)
  assert.match(scenario.tactics[0].detail, /counter outlet/)
  assert.deepEqual(scenario.tactics.map((tactic) => tactic.number), [1, 2, 3, 4])
  assert.deepEqual(scenario.skillSet, [
    'Cover shadow',
    'Delay and jockey',
    'Inside-out press angle',
    'Cover and balance',
    'Unit shifting',
  ])
  assert.deepEqual(scenario.principles, ['DENY', 'DIRECT', 'DELAY', 'BALANCE', 'CONTROL & RESTRAINT'])
  assert.ok(scenario.tactics.every((tactic) => tactic.stepIds.every((id) => scenario.steps.some((step) => step.id === id))))
  assert.ok(scenario.steps.every((step) => scenario.principles.includes(step.principle)))
  assert.ok(scenario.steps.every((step) => step.cue.length >= 55 && step.phaseSummary.length >= 55))
})

test('the page exposes geography, an active phase, numbered tactics, and the compact game-plan hierarchy', () => {
  const pageSource = readFileSync(new URL('../pages/DefensiveOrganizationPage.tsx', import.meta.url), 'utf8')

  assert.match(pageSource, /Channel 3/)
  assert.match(pageSource, /Channel 2/)
  assert.match(pageSource, /Channel 1/)
  assert.match(pageSource, /Current phase principle/)
  assert.match(pageSource, /Game plan/)
  assert.match(pageSource, /Opponent problem/)
  assert.match(pageSource, /scenario\.tactics\.map/)
  assert.match(pageSource, /tactic\.stepIds\.includes\(activeStepId\)/)
  assert.match(pageSource, /fadeRouteHistory/)
})
