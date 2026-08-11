/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { PICKERING_SQUAD } from '../../data/squad.ts'
import { FORMATION_POSITIONS } from '../../data/formations.ts'
import {
  PLAYER_POSITION_TO_PROFILE_ID,
  POSITIONAL_PROFILES,
  getProfileForPosition,
  getPositionalProfile,
} from './positionalProfiles.ts'

test('seven approved positional groups exist in evaluator order', () => {
  assert.deepEqual(
    POSITIONAL_PROFILES.map((profile) => profile.id),
    [
      'goalkeeper',
      'centre-backs',
      'fullbacks',
      'central-midfield',
      'attacking-midfielder',
      'wide-players',
      'striker',
    ],
  )
})

test('every profile satisfies the Canada Soccer category and four-Moment structure', () => {
  POSITIONAL_PROFILES.forEach((profile) => {
    assert.ok(profile.physical.length >= 4, `${profile.id}: physical`)
    assert.ok(profile.social.length >= 4, `${profile.id}: social`)
    assert.ok(profile.mental.length >= 4, `${profile.id}: mental`)
    assert.ok(profile.skillSet.length >= 5, `${profile.id}: skill set`)
    assert.ok(profile.moments.attackingOrganization.length >= 2, `${profile.id}: AO`)
    assert.ok(profile.moments.defensiveOrganization.length >= 2, `${profile.id}: DO`)
    assert.ok(profile.moments.attackingTransition.length >= 2, `${profile.id}: AT`)
    assert.ok(profile.moments.defensiveTransition.length >= 2, `${profile.id}: DT`)
    assert.ok(profile.evidence.length >= 1, `${profile.id}: evidence reference`)
  })
})

test('positional evidence is distributed across the strongest completed practice plans', () => {
  const evidenceByProfile = Object.fromEntries(
    POSITIONAL_PROFILES.map((profile) => [profile.id, profile.evidence[0].session]),
  )

  assert.deepEqual(evidenceByProfile, {
    goalkeeper: 'Practice Session 3',
    'centre-backs': 'Practice Session 3',
    fullbacks: 'Practice Session 10',
    'central-midfield': 'Practice Session 6',
    'attacking-midfielder': 'Practice Session 9',
    'wide-players': 'Practice Session 1',
    striker: 'Practice Session 9',
  })
  assert.ok(new Set(Object.values(evidenceByProfile)).size >= 5)
})

test('profiles show the correct current Pickering squad occupants', () => {
  const occupantsByProfile = Object.fromEntries(
    POSITIONAL_PROFILES.map((profile) => [
      profile.id,
      profile.occupants.map((occupant) => `#${occupant.number} ${occupant.name}`),
    ]),
  )

  assert.deepEqual(occupantsByProfile, {
    goalkeeper: ['#1 Owen'],
    'centre-backs': ['#4 Chin', '#5 Marc'],
    fullbacks: ['#2 Aaron', '#3 Christian'],
    'central-midfield': ['#6 Viktor', '#8 Toyeeb'],
    'attacking-midfielder': ['#10 Peter'],
    'wide-players': ['#7 Seth', '#11 Justin'],
    striker: ['#9 Anushan'],
  })
})

test('#6 and #8 share a unit but retain visibly distinct role emphases', () => {
  const midfield = getPositionalProfile('central-midfield')
  const six = midfield.roleEmphases?.find((emphasis) => emphasis.number === 6)
  const eight = midfield.roleEmphases?.find((emphasis) => emphasis.number === 8)

  assert.ok(six)
  assert.ok(eight)
  assert.match(six.priorities.join(' '), /protection.*circulation.*balance.*screening/i)
  assert.match(eight.priorities.join(' '), /progression.*connection.*carrying.*forward support/i)
  assert.notDeepEqual(six.priorities, eight.priorities)
  assert.match(midfield.moments.attackingOrganization.join(' '), /#6 supports circulation and balance/i)
  assert.match(midfield.moments.attackingOrganization.join(' '), /#8 connects lines/i)
})

test('every current player maps to the intended positional group', () => {
  const expected = new Map<number, string>([
    [1, 'goalkeeper'],
    [2, 'fullbacks'],
    [3, 'fullbacks'],
    [4, 'centre-backs'],
    [5, 'centre-backs'],
    [6, 'central-midfield'],
    [7, 'wide-players'],
    [8, 'central-midfield'],
    [9, 'striker'],
    [10, 'attacking-midfielder'],
    [11, 'wide-players'],
  ])

  PICKERING_SQUAD.forEach((player) => {
    assert.equal(getProfileForPosition(player.position).id, expected.get(player.number), `#${player.number}`)
  })

  assert.equal(Object.keys(PLAYER_POSITION_TO_PROFILE_ID).length, 10)
})

test('the profile pitch uses the approved AO 1-4-4-2 reference instead of the old 4-3-3 layout', () => {
  const source = readFileSync(new URL('../pages/PlayersPage.tsx', import.meta.url), 'utf8')

  assert.match(source, /FORMATION_POSITIONS\['attacking-442'\]/)
  assert.match(source, /const BOARD_WIDTH = 540/)
  assert.match(source, /positional-profile-detail__body/)
  assert.doesNotMatch(source, /FORMATION_POSITIONS\['attacking-433'\]/)
})

test('#10 sits underneath #9 as the attacking midfielder or secondary striker in the AO 1-4-4-2', () => {
  const formation = FORMATION_POSITIONS['attacking-442']

  assert.ok(formation[10].y < formation[9].y, '#10 must be slightly deeper than the striker')
  assert.ok(formation[10].y > formation[7].y, '#10 must remain above the midfield line')
  assert.ok(formation[9].y - formation[10].y <= 8, '#10 must remain connected as a secondary striker')
})

test('desktop positional profiles prioritize a larger pitch and full-width readable information bands', () => {
  const styles = readFileSync(new URL('../PresentationLayout.css', import.meta.url), 'utf8')
  const desktopStyles = styles.slice(styles.indexOf('@media (min-width: 1280px) and (min-height: 760px)'))

  assert.match(desktopStyles, /profile-formation-card__pitch[\s\S]*?520px/)
  assert.match(desktopStyles, /profile-priority-grid[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/)
  assert.match(desktopStyles, /profile-moment-tabs[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/)
  assert.match(desktopStyles, /profile-priority-card li,[\s\S]*?font-size: 0\.82rem/)
})

test('fullback defensive language protects inside and directs play to Channel 1', () => {
  const fullbacks = getPositionalProfile('fullbacks')
  const defensiveOrganization = fullbacks.moments.defensiveOrganization.join(' ')

  assert.match(defensiveOrganization, /protect the inside/i)
  assert.match(defensiveOrganization, /deny Channels 2-3/i)
  assert.match(defensiveOrganization, /direct play toward Channel 1/i)
  assert.doesNotMatch(defensiveOrganization, /protect Channel 1/i)
})
