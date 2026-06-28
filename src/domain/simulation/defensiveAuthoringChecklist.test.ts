/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { SCENARIOS } from '../../data/scenarios.ts'
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
  'back-five-to-wing-back-attack',
  'corner-short-decoy-wide-delivery',
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
      { arrowId: 'wide-build-away-eight-screen', type: 'recovery', side: 'away', playerNumber: 8, labelTerms: ['screen'] },
      { arrowId: 'wide-build-away-five-track-nine', type: 'recovery', side: 'away', playerNumber: 5, labelTerms: ['track'] },
      { arrowId: 'wide-build-away-two-tuck', type: 'recovery', side: 'away', playerNumber: 2, labelTerms: ['tuck'] },
    ],
    scenarioTerms: ['width', 'support', 'forward'],
  },
  {
    scenarioId: 'counter-quickly-on-turnover',
    expectedMoment: 'Attacking Transition',
    movements: [
      { arrowId: 'counter-away-ten-counterpress', type: 'press', side: 'away', playerNumber: 10, labelTerms: ['counterpress'] },
      { arrowId: 'counter-away-two-recover', type: 'recovery', side: 'away', playerNumber: 2, labelTerms: ['recover'] },
      { arrowId: 'counter-away-five-track-nine', type: 'recovery', side: 'away', playerNumber: 5, labelTerms: ['track'] },
      { arrowId: 'counter-away-four-drop', type: 'recovery', side: 'away', playerNumber: 4, labelTerms: ['drop'] },
    ],
    scenarioTerms: ['counter', 'forward', 'support'],
  },
  {
    scenarioId: 'protect-lead-in-back-five',
    expectedMoment: 'Defensive Transition',
    movements: [
      { arrowId: 'fuse-away-two-collect', type: 'recovery', side: 'away', playerNumber: 2, labelTerms: ['collect'] },
      { arrowId: 'fuse-away-six-support', type: 'run', side: 'away', playerNumber: 6, labelTerms: ['support'] },
      { arrowId: 'fuse-four-cover', type: 'recovery', side: 'home', playerNumber: 4, labelTerms: ['cover'] },
      { arrowId: 'fuse-two-tuck', type: 'recovery', side: 'home', playerNumber: 2, labelTerms: ['tuck'] },
    ],
    scenarioTerms: ['press', 'cover', 'counter'],
  },
  {
    scenarioId: 'back-five-to-wing-back-attack',
    expectedMoment: 'Attacking Organization',
    movements: [
      { arrowId: 'wing-back-away-three-delay', type: 'press', side: 'away', playerNumber: 3, labelTerms: ['delay'] },
      { arrowId: 'wing-back-away-eight-screen', type: 'recovery', side: 'away', playerNumber: 8, labelTerms: ['screen'] },
      { arrowId: 'wing-back-away-four-track-ten', type: 'recovery', side: 'away', playerNumber: 4, labelTerms: ['track'] },
      { arrowId: 'wing-back-away-six-drop', type: 'recovery', side: 'away', playerNumber: 6, labelTerms: ['drop'] },
    ],
    scenarioTerms: ['wing-back', 'central', 'rest'],
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

test('scenario list contains only the retained main five scenarios', () => {
  assert.deepEqual(
    SCENARIOS.map((scenario) => scenario.id),
    MAIN_SCENARIO_IDS,
  )

  REMOVED_DEFENSIVE_SCENARIO_IDS.forEach((scenarioId) => {
    assert.equal(SCENARIOS.some((scenario) => scenario.id === scenarioId), false)
  })
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
