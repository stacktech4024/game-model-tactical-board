/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { LIVE_BOARD_SCENARIOS, SCENARIOS } from '../../data/scenarios.ts'
import type {
  AuthoredScenarioArrow,
  ScenarioArrowType,
  ScenarioDefinition,
} from '../scenarios/scenarioTypes.ts'

type MovementEvidence = {
  arrowId: string
  type: ScenarioArrowType
  side: 'home' | 'away'
  playerNumber: number
  labelTerms: readonly string[]
}

type MainScenarioChecklist = {
  scenarioId: string
  expectedMoment: ScenarioDefinition['moment']
  movements: readonly MovementEvidence[]
  scenarioTerms: readonly string[]
}

const MAIN_SCENARIO_IDS = [
  'build-through-wide-channels',
  'counter-quickly-on-turnover',
  'protect-lead-in-back-five',
  'corner-short-decoy-wide-delivery',
  'defensive-block-force-wide',
] as const

const REMOVED_DEFENSIVE_SCENARIO_IDS = [
  'compact-defensive-block',
  'compact-defensive-block-opposite-side',
  'central-denial-wide-trap',
] as const

const MAIN_SCENARIO_OFF_BALL_CHECKLIST = [
  {
    scenarioId: 'build-through-wide-channels',
    expectedMoment: 'Attacking Organization',
    movements: [
      { arrowId: 'wide-build-away-eleven-press', type: 'press', side: 'away', playerNumber: 11, labelTerms: ['press'] },
      { arrowId: 'wide-build-away-six-shift', type: 'recovery', side: 'away', playerNumber: 6, labelTerms: ['screen'] },
      { arrowId: 'wide-build-away-five-track-nine', type: 'recovery', side: 'away', playerNumber: 5, labelTerms: ['track'] },
      { arrowId: 'wide-build-away-two-tuck', type: 'recovery', side: 'away', playerNumber: 2, labelTerms: ['tuck'] },
    ],
    scenarioTerms: ['width', 'support', 'forward'],
  },
  {
    scenarioId: 'counter-quickly-on-turnover',
    expectedMoment: 'Attacking Transition',
    movements: [
      { arrowId: 'counter-away-ten-first-pressure', type: 'press', side: 'away', playerNumber: 10, labelTerms: ['pressure'] },
      { arrowId: 'counter-away-six-cover-forward', type: 'recovery', side: 'away', playerNumber: 6, labelTerms: ['cover'] },
      { arrowId: 'counter-away-two-recover-outside', type: 'recovery', side: 'away', playerNumber: 2, labelTerms: ['recover'] },
      { arrowId: 'counter-away-five-track-nine', type: 'recovery', side: 'away', playerNumber: 5, labelTerms: ['track'] },
    ],
    scenarioTerms: ['counter', 'forward', 'intercept'],
  },
  {
    scenarioId: 'protect-lead-in-back-five',
    expectedMoment: 'Defensive Transition',
    movements: [
      { arrowId: 'fuse-away-eight-intercept', type: 'press', side: 'away', playerNumber: 8, labelTerms: ['intercept'] },
      { arrowId: 'fuse-away-nine-outlet', type: 'run', side: 'away', playerNumber: 9, labelTerms: ['outlet'] },
      { arrowId: 'fuse-eight-first-press', type: 'press', side: 'home', playerNumber: 8, labelTerms: ['reacts'] },
      { arrowId: 'fuse-six-recover-midfield', type: 'recovery', side: 'home', playerNumber: 6, labelTerms: ['recover'] },
    ],
    scenarioTerms: ['press', 'cover', 'counter'],
  },
  {
    scenarioId: 'corner-short-decoy-wide-delivery',
    expectedMoment: 'Set Pieces',
    movements: [
      { arrowId: 'corner-away-three-step-short', type: 'press', side: 'away', playerNumber: 3, labelTerms: ['short'] },
      { arrowId: 'corner-away-four-near-post', type: 'recovery', side: 'away', playerNumber: 4, labelTerms: ['near-post'] },
      { arrowId: 'corner-away-two-back-post', type: 'recovery', side: 'away', playerNumber: 2, labelTerms: ['back-post'] },
      { arrowId: 'corner-away-five-track-nine', type: 'recovery', side: 'away', playerNumber: 5, labelTerms: ['track'] },
    ],
    scenarioTerms: ['corner', 'corridor', 'second'],
  },
] as const satisfies readonly MainScenarioChecklist[]

function getScenario(id: string): ScenarioDefinition {
  const scenario = SCENARIOS.find((item) => item.id === id)

  assert.ok(scenario, `Expected scenario ${id} to exist`)

  return scenario
}

function getArrow(scenario: ScenarioDefinition, arrowId: string): AuthoredScenarioArrow {
  const arrow = scenario.arrows?.find((item) => item.id === arrowId)

  assert.ok(arrow, `${scenario.id}: expected arrow ${arrowId} to exist`)

  return arrow
}

function normalize(value: string): string {
  return value.toLowerCase()
}

function scenarioSearchText(scenario: ScenarioDefinition): string {
  return normalize(
    [
      scenario.title,
      scenario.strategy,
      scenario.description,
      scenario.fieldGeography.description,
      scenario.system.description,
      ...scenario.tactics,
      ...scenario.skillSet,
      ...scenario.coachingPoints,
      ...scenario.phaseSteps.flatMap((step) => [step.label, step.coachingCue]),
      ...(scenario.arrows ?? []).map((arrow) => arrow.label ?? ''),
      ...(scenario.markers ?? []).map((marker) => marker.label),
    ].join(' '),
  )
}

function assertTextIncludes(context: string, text: string, term: string): void {
  assert.ok(normalize(text).includes(normalize(term)), `${context}: expected text to include "${term}"`)
}

function assertArrowIsPhaseReferenced(scenario: ScenarioDefinition, arrowId: string): void {
  assert.ok(
    scenario.phaseSteps.some((step) => step.relatedArrows?.includes(arrowId)),
    `${scenario.id}: expected ${arrowId} to be referenced by a phase step`,
  )
}

function assertMovementEvidence(scenario: ScenarioDefinition, evidence: MovementEvidence): void {
  const arrow = getArrow(scenario, evidence.arrowId)

  assert.equal(arrow.type, evidence.type, `${scenario.id}: ${evidence.arrowId} type`)
  assert.equal(arrow.side ?? 'home', evidence.side, `${scenario.id}: ${evidence.arrowId} side`)
  assert.equal(arrow.playerNumber, evidence.playerNumber, `${scenario.id}: ${evidence.arrowId} player number`)

  evidence.labelTerms.forEach((term) => {
    assertTextIncludes(`${scenario.id}: ${evidence.arrowId} label`, arrow.label ?? '', term)
  })

  assertArrowIsPhaseReferenced(scenario, evidence.arrowId)
}

test('scenario list contains only the retained five scenarios', () => {
  assert.deepEqual(
    SCENARIOS.map((scenario) => scenario.id),
    MAIN_SCENARIO_IDS,
  )

  REMOVED_DEFENSIVE_SCENARIO_IDS.forEach((scenarioId) => {
    assert.equal(SCENARIOS.some((scenario) => scenario.id === scenarioId), false)
  })
})

test('general live-board selector omits the corner covered by the dedicated set-piece section', () => {
  assert.deepEqual(
    LIVE_BOARD_SCENARIOS.map((scenario) => scenario.id),
    MAIN_SCENARIO_IDS.filter((scenarioId) => scenarioId !== 'corner-short-decoy-wide-delivery'),
  )
})

test('main scenarios keep authored opponent and off-ball movement evidence', () => {
  MAIN_SCENARIO_OFF_BALL_CHECKLIST.forEach((checklist) => {
    const scenario = getScenario(checklist.scenarioId)
    const searchText = scenarioSearchText(scenario)

    assert.equal(scenario.moment, checklist.expectedMoment, `${scenario.id}: protected moment`)
    assert.equal(scenario.momentOfGame, checklist.expectedMoment, `${scenario.id}: protected moment of game`)

    checklist.movements.forEach((movementEvidence) => {
      assertMovementEvidence(scenario, movementEvidence)
    })

    checklist.scenarioTerms.forEach((term) => {
      assert.ok(
        searchText.includes(normalize(term)),
        `${scenario.id}: expected authored scenario text to include "${term}"`,
      )
    })
  })
})
