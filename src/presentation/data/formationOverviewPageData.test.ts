import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { FORMATION_OVERVIEWS } from './formationOverviewPageData.ts'

test('formation overview pages use the portfolio systems and only eleven Pickering players', () => {
  assert.equal(FORMATION_OVERVIEWS.attacking.formation, '1-4-4-2')
  assert.equal(FORMATION_OVERVIEWS.defensive.formation, '1-4-2-3-1')

  Object.values(FORMATION_OVERVIEWS).forEach((overview) => {
    assert.equal(overview.players.length, 11)
    assert.equal(new Set(overview.players.map((player) => player.number)).size, 11)
    assert.ok(overview.players.every((player) => player.name.length > 0))
    assert.ok(overview.players.every((player) => player.role.length > 0))
    assert.ok(overview.players.every((player) => player.left >= 0 && player.left <= 100))
    assert.ok(overview.players.every((player) => player.bottom >= 0 && player.bottom <= 100))
  })
})

test('attacking and defensive pages clearly explain the possession moment', () => {
  assert.match(FORMATION_OVERVIEWS.attacking.eyebrow, /when we are attacking/i)
  assert.match(FORMATION_OVERVIEWS.attacking.description, /have the ball/i)
  assert.match(FORMATION_OVERVIEWS.defensive.eyebrow, /when we are defending/i)
  assert.match(FORMATION_OVERVIEWS.defensive.description, /opponent has the ball/i)
})

test('player placement matches the two portfolio reference diagrams', () => {
  const attacking = new Map(FORMATION_OVERVIEWS.attacking.players.map((player) => [player.number, player]))
  const defensive = new Map(FORMATION_OVERVIEWS.defensive.players.map((player) => [player.number, player]))

  assert.ok(attacking.get(11)!.bottom > attacking.get(10)!.bottom)
  assert.ok(attacking.get(9)!.bottom > attacking.get(7)!.bottom)
  assert.ok(attacking.get(10)!.left < attacking.get(6)!.left)
  assert.ok(attacking.get(7)!.left > attacking.get(8)!.left)
  assert.equal(attacking.get(11)!.role, 'Second Striker')

  assert.ok(defensive.get(9)!.bottom > defensive.get(11)!.bottom)
  assert.ok(defensive.get(11)!.left > defensive.get(10)!.left)
  assert.ok(defensive.get(11)!.left < defensive.get(7)!.left)
  assert.ok(defensive.get(6)!.bottom > defensive.get(5)!.bottom)
  assert.ok(defensive.get(8)!.bottom > defensive.get(4)!.bottom)
})

test('#11 and #9 use short inward runs toward the box', () => {
  const pageSource = readFileSync(new URL('../pages/FormationOverviewPage.tsx', import.meta.url), 'utf8')

  assert.match(pageSource, /M40 29 C42 25 44 21 46 17/)
  assert.match(pageSource, /M60 29 C58 25 56 21 54 17/)
  assert.doesNotMatch(pageSource, /M40 30 C38 23 35 16 32 10/)
  assert.doesNotMatch(pageSource, /M60 30 C62 23 65 16 68 10/)
})

test('supporting players use short runs that stay relevant to their nearby space', () => {
  const pageSource = readFileSync(new URL('../pages/FormationOverviewPage.tsx', import.meta.url), 'utf8')

  const shortSupportingRuns = [
    'M22 68 C21 62 22 56 25 50',
    'M42 74 L42 60',
    'M58 74 L58 60',
    'M78 68 C79 62 78 56 75 50',
    'M27 48 C27 42 29 37 32 33',
    'M43 49 C43 44 44 40 46 36',
    'M57 49 C57 44 56 40 54 36',
    'M73 48 C73 42 71 37 68 33',
  ]

  shortSupportingRuns.forEach((run) => assert.ok(pageSource.includes(run)))
  assert.doesNotMatch(pageSource, /M22 68 C20 54 23 34 31 15/)
  assert.doesNotMatch(pageSource, /M78 68 C80 53 77 33 69 14/)
})
