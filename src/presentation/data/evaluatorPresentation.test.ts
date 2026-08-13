import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PRESENTATION_PAGE_ORDER } from './pageOrder.ts'
import {
  EVALUATOR_PAGE_ORDER,
  EVALUATOR_PRESENTATION,
  EVALUATOR_TOTAL_SECONDS,
  formatPlannedTime,
  getEvaluatorStep,
} from './evaluatorPresentation.ts'

const excludedWrittenModelPages = [
  'moments',
  'attacking-transition',
  'defensive-transition',
  'defensive-organization',
  'set-pieces',
  'live-board',
  'players',
  'how-we-train',
  'microcycle-detail',
]

test('evaluator mode is an exact 20-minute sequence', () => {
  assert.equal(EVALUATOR_TOTAL_SECONDS, 20 * 60)
  assert.equal(formatPlannedTime(EVALUATOR_TOTAL_SECONDS), '20:00')
  assert.equal(new Set(EVALUATOR_PAGE_ORDER).size, EVALUATOR_PAGE_ORDER.length)
  assert.equal(EVALUATOR_PAGE_ORDER.length, 14)
  assert.deepEqual(EVALUATOR_PAGE_ORDER, [
    'cover',
    'intro',
    'philosophy',
    'pitch-geography',
    'attacking-formation',
    'defensive-formation',
    'game-analysis',
    'skills',
    'how-we-train-session',
    'how-we-train-pictures',
    'how-we-train-transfer',
    'microcycle',
    'methodology',
    'closing',
  ])

  excludedWrittenModelPages.forEach((pageId) => {
    assert.ok(PRESENTATION_PAGE_ORDER.includes(pageId as never))
    assert.ok(!EVALUATOR_PAGE_ORDER.includes(pageId as never), `${pageId} must stay out of AO capping mode`)
  })
})

test('every evaluator step has a complete run-of-show entry', () => {
  EVALUATOR_PRESENTATION.forEach((step) => {
    assert.ok(step.plannedSeconds > 0, `${step.pageId}: planned time`)
    assert.ok(step.purpose.length > 0, `${step.pageId}: purpose`)
    assert.ok(step.script.length > 0, `${step.pageId}: script`)
    assert.ok(step.script.every((paragraph) => paragraph.trim().length > 0), `${step.pageId}: script paragraph`)
    assert.ok(step.transition.length > 0, `${step.pageId}: transition`)
    assert.equal(getEvaluatorStep(step.pageId), step)
  })
})

test('spoken script covers all evaluator-critical AO evidence', () => {
  const attackingFormation = getEvaluatorStep('attacking-formation')?.script.join(' ') ?? ''
  const defensiveFormation = getEvaluatorStep('defensive-formation')?.script.join(' ') ?? ''
  const gameAnalysis = getEvaluatorStep('game-analysis')?.script.join(' ') ?? ''
  const skills = getEvaluatorStep('skills')?.script.join(' ') ?? ''
  const transfer = getEvaluatorStep('how-we-train-transfer')?.script.join(' ') ?? ''
  const microcycle = getEvaluatorStep('microcycle')?.script.join(' ') ?? ''
  const methodology = getEvaluatorStep('methodology')?.script.join(' ') ?? ''

  assert.match(attackingFormation, /1-4-4-2/)
  assert.match(attackingFormation, /attacking/i)
  assert.match(defensiveFormation, /1-4-2-3-1/)
  assert.match(defensiveFormation, /defending/i)
  assert.match(gameAnalysis, /Attacking Organization/i)
  assert.match(gameAnalysis, /1-4-4-2/)
  assert.match(gameAnalysis, /#2/)
  assert.match(gameAnalysis, /strategy/i)
  assert.match(gameAnalysis, /tactics/i)
  assert.match(gameAnalysis, /Skill Set/i)
  assert.match(skills, /#2 Aaron|#3 Christian/)
  assert.match(skills, /#7|#11/)
  assert.match(skills, /#9/)
  assert.match(transfer, /Game Problem/i)
  assert.match(transfer, /Training Activity/i)
  assert.match(transfer, /Player Behaviour/i)
  assert.match(transfer, /Match Transfer/i)
  assert.match(microcycle, /Zones 2 and 3 into Zone 4/i)
  assert.match(microcycle, /duration, RPE, methodology, activity types, and physical load/i)
  assert.match(methodology, /Whole-Part-Whole/i)
  assert.match(methodology, /SCORE/)
})

test('app and layout expose evaluator guide, timer, notes, and central-wide lock', () => {
  const app = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8')
  const layout = readFileSync(new URL('../PresentationLayout.tsx', import.meta.url), 'utf8')

  assert.match(app, /path="\/evaluator"/)
  assert.match(layout, /mode.*evaluator/)
  assert.match(layout, /evaluatorRehearsalStartedAt/)
  assert.match(layout, /evaluator-speaker-notes/)
  assert.match(layout, /central-wide/)
  assert.match(layout, /EVALUATOR_PAGE_ORDER/)
})
