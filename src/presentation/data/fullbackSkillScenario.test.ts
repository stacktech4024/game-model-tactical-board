/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { getFullbackSkillPixiScenario } from './fullbackSkillPixiAdapter.ts'
import {
  FULLBACK_DEFAULT_SKILL_ID,
  FULLBACK_SKILL_ORDER,
  FULLBACK_SKILL_SCENARIOS,
  getFullbackSkillScenario,
} from './fullbackSkillScenario.ts'

const expectedCoachingFields = ['who', 'what', 'when', 'where', 'why', 'how']

test('Fullbacks remain the default with exactly three named skill examples', () => {
  assert.equal(FULLBACK_DEFAULT_SKILL_ID, 'wide-release-overlap')
  assert.deepEqual(FULLBACK_SKILL_ORDER, [
    'wide-release-overlap',
    'defend-wide-1v1',
    'recover-inside-after-loss',
  ])
  assert.deepEqual(
    FULLBACK_SKILL_ORDER.map((id) => getFullbackSkillScenario(id).tabLabel),
    ['Wide Release & Overlap', 'Defend Wide 1v1', 'Recover Inside'],
  )
})

test('Wide Release and Overlap carries the complete assessor-facing Game Model chain', () => {
  const skill = getFullbackSkillScenario('wide-release-overlap')

  assert.equal(skill.moment, 'Attacking Organization')
  assert.equal(skill.system, '1-4-4-2')
  assert.match(skill.geography, /Zones 2–3 → Zone 4/)
  assert.match(skill.geography, /Channels 1–2/)
  assert.deepEqual(Object.keys(skill.coachingDetail), expectedCoachingFields)
  assert.match(skill.coachingDetail.who, /#2 Aaron \/ #3 Christian/)
  assert.ok(skill.observableSuccess.length >= 4)
  assert.ok(skill.observableSuccess.length <= 5)
  assert.deepEqual(skill.matchTransfer, [
    'CIRCULATE',
    'RELEASE WIDE',
    'FIX DEFENDER',
    'FULLBACK OVERLAPS',
    'ENTER ZONE 4',
    'CROSS / CUTBACK / RESET',
  ])
  assert.equal(skill.relatedTraining.label, 'Central → Wide')
  assert.equal(skill.relatedTraining.href, '/presentation/how-we-train/examples?example=central-wide')
})

test('all Fullback skills include concise coaching detail, success and transfer', () => {
  FULLBACK_SKILL_ORDER.forEach((id) => {
    const skill = getFullbackSkillScenario(id)

    assert.deepEqual(Object.keys(skill.coachingDetail), expectedCoachingFields, `${id}: coaching detail`)
    assert.ok(skill.observableSuccess.length >= 4, `${id}: observable success`)
    assert.ok(skill.observableSuccess.length <= 5, `${id}: concise observable success`)
    assert.ok(skill.matchTransfer.length >= 4, `${id}: match transfer`)
    assert.ok(skill.transferStatement.length > 0, `${id}: transfer statement`)
    assert.ok(skill.relatedTraining.href.startsWith('/presentation/how-we-train/'), `${id}: How We Train link`)
    assert.ok(skill.animationDescription.length > 0, `${id}: accessible animation description`)
  })
})

test('every visual explicitly authors player facing and realistic opposition movement', () => {
  FULLBACK_SKILL_ORDER.forEach((id) => {
    const skill = getFullbackSkillScenario(id)

    skill.players.forEach((player) => {
      assert.ok(Number.isFinite(player.facingAngle), `${id}/${player.id}: starting facing`)
    })

    assert.ok(skill.players.some((player) => player.side === 'away'), `${id}: opposition`)
    assert.ok(
      skill.steps.some((step) => {
        const carrierMoves = Boolean(
          step.playerId &&
          step.playerTo &&
          skill.players.find((player) => player.id === step.playerId)?.side === 'away',
        )
        const supportingMove = step.playerMoves?.some((move) =>
          skill.players.find((player) => player.id === move.playerId)?.side === 'away',
        )

        return carrierMoves || supportingMove
      }),
      `${id}: moving opposition`,
    )
    assert.ok(skill.routes.length > 0, `${id}: next-action routes`)
  })
})

test('the primary animation authors scan, open reception, overlap, Zone 4 orientation and delivery', () => {
  const skill = getFullbackSkillScenario('wide-release-overlap')
  const scan = skill.steps.find((step) => step.id === 'fullback-scan')
  const receive = skill.steps.find((step) => step.id === 'fullback-receive')
  const overlap = skill.steps.find((step) => step.id === 'overlap-trigger')
  const zoneFour = skill.steps.find((step) => step.id === 'zone-four-receive')
  const delivery = skill.steps.find((step) => step.id === 'zone-four-decision')

  assert.ok(scan?.playerFacings?.some((facing) => facing.playerId === 'fb-2'))
  assert.ok(Number.isFinite(receive?.facingAngle))
  assert.equal(overlap?.playerId, 'fb-2')
  assert.ok(Number.isFinite(overlap?.facingAngle))
  assert.equal(zoneFour?.playerId, 'fb-2')
  assert.ok(Number.isFinite(zoneFour?.facingAngle))
  assert.ok(delivery?.playerFacings?.some((facing) => facing.playerId === 'fb-2'))
  assert.match(delivery?.cue ?? '', /cross shown; cut back or reset/i)
})

test('the Pixi adapter preserves orientation, multi-player movement, routes and the accessible label', () => {
  const adapted = getFullbackSkillPixiScenario('wide-release-overlap')
  const source = getFullbackSkillScenario('wide-release-overlap')

  assert.equal(adapted.animationDescription, source.animationDescription)
  assert.deepEqual(adapted.routes, source.routes)
  assert.ok(adapted.players.every((player) => Number.isFinite(player.facingAngle)))
  assert.ok(adapted.steps?.some((step) => (step.playerMoves?.length ?? 0) > 0))
  assert.ok(adapted.steps?.some((step) => (step.playerFacings?.length ?? 0) > 0))
})

test('evaluator-facing Fullback copy avoids stale role and generic evidence language', () => {
  const copy = JSON.stringify(FULLBACK_SKILL_SCENARIOS)
  const pageSource = readFileSync(new URL('../pages/SkillsPage.tsx', import.meta.url), 'utf8')

  assert.doesNotMatch(`${copy}${pageSource}`, /wingback/i)
  assert.doesNotMatch(`${copy}${pageSource}`, /evidence[- ]based|evidence[- ]backed|evidence proves|direct evidence demonstrates/i)
  assert.doesNotMatch(pageSource, /POSITIONAL_PROFILES|profile-drawer/)
  assert.doesNotMatch(pageSource, /Wide Players|Striker Skill/)
})

test('Skills page exposes semantic keyboard tabs and an accessible animation', () => {
  const pageSource = readFileSync(new URL('../pages/SkillsPage.tsx', import.meta.url), 'utf8')
  const pixiSource = readFileSync(new URL('../../renderers/pixi/PixiPitchPreview.tsx', import.meta.url), 'utf8')
  const styleSource = readFileSync(new URL('../PresentationLayout.css', import.meta.url), 'utf8')

  assert.match(pageSource, /role="tablist"/)
  assert.match(pageSource, /role="tab"/)
  assert.match(pageSource, /role="tabpanel"/)
  assert.match(pageSource, /aria-selected=/)
  assert.match(pageSource, /aria-controls=/)
  assert.match(pageSource, /event\.key === 'ArrowRight'/)
  assert.match(pageSource, /event\.key === 'ArrowLeft'/)
  assert.match(pageSource, /event\.key === 'Home'/)
  assert.match(pageSource, /event\.key === 'End'/)
  assert.match(pageSource, /tabRefs\.current\[nextIndex\]\?\.focus\(\)/)
  assert.match(pageSource, /accessibleLabel=\{pixiScenario\.animationDescription\}/)
  assert.match(pixiSource, /prefers-reduced-motion: reduce/)
  assert.match(pixiSource, /role="img"/)
  assert.match(pixiSource, /aria-label=\{accessibleLabel\}/)
  assert.match(pageSource, /const PIXI_PREVIEW_WIDTH = 268/)
  assert.match(styleSource, /@media \(min-width: 721px\) and \(max-height: 800px\)/)
  assert.match(styleSource, /\.fullback-skill-pitch \{[\s\S]*?width: min\(100%, 252px\)/)
  assert.match(styleSource, /\.fullback-skill-tab:focus-visible/)
})
