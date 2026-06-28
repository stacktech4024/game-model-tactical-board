/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { SCENARIOS } from '../../data/scenarios.ts'
import type {
  AuthoredScenarioArrow,
  ScenarioArrowType,
  ScenarioDefinition,
} from '../scenarios/scenarioTypes.ts'

type ChecklistRole = 'press' | 'cover' | 'balance' | 'screen' | 'force-back'

type ArrowEvidence = {
  arrowId: string
  type: ScenarioArrowType
  labelTerms: readonly string[]
  playerNumber?: number
  side?: 'home' | 'away'
}

type RoleEvidence = {
  role: ChecklistRole
  arrows: readonly ArrowEvidence[]
  scenarioTerms: readonly string[]
}

type DefensiveScenarioChecklist = {
  scenarioId: string
  roles: readonly RoleEvidence[]
}

const DEFENSIVE_AUTHORING_CHECKLIST = [
  {
    scenarioId: 'compact-defensive-block',
    roles: [
      {
        role: 'press',
        arrows: [
          { arrowId: 'compact-two-step-wide', type: 'press', playerNumber: 2, labelTerms: ['press'] },
          { arrowId: 'compact-seven-block-switch', type: 'press', playerNumber: 7, labelTerms: ['block switch'] },
        ],
        scenarioTerms: ['press', 'pressure', 'direct'],
      },
      {
        role: 'cover',
        arrows: [
          { arrowId: 'compact-five-balance-slide', type: 'recovery', playerNumber: 5, labelTerms: ['cover'] },
        ],
        scenarioTerms: ['cover', 'behind'],
      },
      {
        role: 'balance',
        arrows: [
          { arrowId: 'compact-four-cover-slide', type: 'recovery', playerNumber: 4, labelTerms: ['balance'] },
          { arrowId: 'compact-three-tuck-in', type: 'recovery', playerNumber: 3, labelTerms: ['tuck'] },
          { arrowId: 'compact-eleven-tuck-balance', type: 'recovery', playerNumber: 11, labelTerms: ['balance'] },
        ],
        scenarioTerms: ['balance', 'connected'],
      },
      {
        role: 'screen',
        arrows: [
          { arrowId: 'compact-six-screen-inside', type: 'recovery', playerNumber: 6, labelTerms: ['deny'] },
          { arrowId: 'compact-eight-screen-central', type: 'recovery', playerNumber: 8, labelTerms: ['screen'] },
          { arrowId: 'compact-ten-shade-pivot', type: 'press', playerNumber: 10, labelTerms: ['shade'] },
        ],
        scenarioTerms: ['screen', 'central'],
      },
      {
        role: 'force-back',
        arrows: [
          {
            arrowId: 'compact-opponent-forced-back',
            type: 'pass',
            side: 'away',
            labelTerms: ['forced back'],
          },
        ],
        scenarioTerms: ['force', 'wide', 'contain'],
      },
    ],
  },
  {
    scenarioId: 'compact-defensive-block-opposite-side',
    roles: [
      {
        role: 'press',
        arrows: [
          { arrowId: 'compact-left-three-step-wide', type: 'press', playerNumber: 3, labelTerms: ['press'] },
          {
            arrowId: 'compact-left-eleven-block-switch',
            type: 'press',
            playerNumber: 11,
            labelTerms: ['block switch'],
          },
        ],
        scenarioTerms: ['press', 'pressure', 'control'],
      },
      {
        role: 'cover',
        arrows: [
          {
            arrowId: 'compact-left-four-cover-slide',
            type: 'recovery',
            playerNumber: 4,
            labelTerms: ['cover'],
          },
        ],
        scenarioTerms: ['cover', 'behind'],
      },
      {
        role: 'balance',
        arrows: [
          {
            arrowId: 'compact-left-five-balance-slide',
            type: 'recovery',
            playerNumber: 5,
            labelTerms: ['balance'],
          },
          { arrowId: 'compact-left-two-tuck-in', type: 'recovery', playerNumber: 2, labelTerms: ['tuck'] },
          {
            arrowId: 'compact-left-seven-tuck-balance',
            type: 'recovery',
            playerNumber: 7,
            labelTerms: ['balance'],
          },
        ],
        scenarioTerms: ['balance', 'connected'],
      },
      {
        role: 'screen',
        arrows: [
          { arrowId: 'compact-left-six-screen-inside', type: 'recovery', playerNumber: 6, labelTerms: ['deny'] },
          {
            arrowId: 'compact-left-eight-screen-central',
            type: 'recovery',
            playerNumber: 8,
            labelTerms: ['screen'],
          },
          { arrowId: 'compact-left-ten-shade-pivot', type: 'press', playerNumber: 10, labelTerms: ['shade'] },
        ],
        scenarioTerms: ['screen', 'central'],
      },
      {
        role: 'force-back',
        arrows: [
          {
            arrowId: 'compact-left-opponent-forced-back',
            type: 'pass',
            side: 'away',
            labelTerms: ['forced back'],
          },
        ],
        scenarioTerms: ['force', 'backward', 'contain'],
      },
    ],
  },
  {
    scenarioId: 'central-denial-wide-trap',
    roles: [
      {
        role: 'press',
        arrows: [
          { arrowId: 'trap-two-step-wide', type: 'press', playerNumber: 2, labelTerms: ['press'] },
          { arrowId: 'trap-seven-block-switch', type: 'press', playerNumber: 7, labelTerms: ['lock'] },
        ],
        scenarioTerms: ['press', 'pressure', 'trap'],
      },
      {
        role: 'cover',
        arrows: [
          { arrowId: 'trap-five-cover-slide', type: 'recovery', playerNumber: 5, labelTerms: ['cover'] },
        ],
        scenarioTerms: ['cover', 'behind'],
      },
      {
        role: 'balance',
        arrows: [
          { arrowId: 'trap-four-balance-slide', type: 'recovery', playerNumber: 4, labelTerms: ['balance'] },
          { arrowId: 'trap-three-tuck-in', type: 'recovery', playerNumber: 3, labelTerms: ['tuck'] },
          { arrowId: 'trap-eleven-lock-inside', type: 'recovery', playerNumber: 11, labelTerms: ['balance'] },
        ],
        scenarioTerms: ['balance', 'compact'],
      },
      {
        role: 'screen',
        arrows: [
          { arrowId: 'trap-six-screen-central', type: 'recovery', playerNumber: 6, labelTerms: ['deny'] },
          { arrowId: 'trap-eight-screen-half-space', type: 'recovery', playerNumber: 8, labelTerms: ['screen'] },
          { arrowId: 'trap-ten-shade-pivot', type: 'press', playerNumber: 10, labelTerms: ['shade'] },
        ],
        scenarioTerms: ['deny', 'central'],
      },
      {
        role: 'force-back',
        arrows: [
          { arrowId: 'trap-opponent-forced-back', type: 'pass', side: 'away', labelTerms: ['contained'] },
        ],
        scenarioTerms: ['force', 'contain', 'wide'],
      },
    ],
  },
] as const satisfies readonly DefensiveScenarioChecklist[]

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

function assertArrowIsPhaseReferenced(scenario: ScenarioDefinition, role: ChecklistRole, arrowId: string): void {
  assert.ok(
    scenario.phaseSteps.some((step) => step.relatedArrows?.includes(arrowId)),
    `${scenario.id} ${role}: expected ${arrowId} to be referenced by a phase step`,
  )
}

function assertArrowEvidence(scenario: ScenarioDefinition, role: ChecklistRole, evidence: ArrowEvidence): void {
  const arrow = getArrow(scenario, evidence.arrowId)

  assert.equal(arrow.type, evidence.type, `${scenario.id} ${role}: ${evidence.arrowId} type`)

  if (typeof evidence.playerNumber === 'number') {
    assert.equal(
      arrow.playerNumber,
      evidence.playerNumber,
      `${scenario.id} ${role}: ${evidence.arrowId} player number`,
    )
  }

  if (evidence.side) {
    assert.equal(arrow.side ?? 'home', evidence.side, `${scenario.id} ${role}: ${evidence.arrowId} side`)
  }

  evidence.labelTerms.forEach((term) => {
    assertTextIncludes(`${scenario.id} ${role}: ${evidence.arrowId} label`, arrow.label ?? '', term)
  })

  assertArrowIsPhaseReferenced(scenario, role, evidence.arrowId)
}

test('protected defensive organization scenarios keep press-cover-balance-screen-force-back authoring evidence', () => {
  DEFENSIVE_AUTHORING_CHECKLIST.forEach((checklist) => {
    const scenario = getScenario(checklist.scenarioId)
    const searchText = scenarioSearchText(scenario)

    assert.equal(scenario.moment, 'Defensive Organization', `${scenario.id}: protected moment`)
    assert.equal(scenario.momentOfGame, 'Defensive Organization', `${scenario.id}: protected moment of game`)

    checklist.roles.forEach((roleEvidence) => {
      roleEvidence.arrows.forEach((arrowEvidence) => {
        assertArrowEvidence(scenario, roleEvidence.role, arrowEvidence)
      })

      roleEvidence.scenarioTerms.forEach((term) => {
        assert.ok(
          searchText.includes(normalize(term)),
          `${scenario.id} ${roleEvidence.role}: expected authored scenario text to include "${term}"`,
        )
      })
    })
  })
})
