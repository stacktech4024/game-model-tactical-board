/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations.ts'
import { SCENARIOS } from '../../data/scenarios.ts'
import type { PitchPoint, ScenarioDefinition, ScenarioMarker } from '../scenarios/scenarioTypes.ts'
import { buildScenarioPlan, type FormationPositions } from './scenarioPlan.ts'
import { getWorldSnapshotAtProgress } from './worldSnapshot.ts'
import type { ScenarioPlan, ScheduledAnimationIntent, TeamSide } from './worldTypes.ts'

const EPSILON = 1e-6

type ReleaseExpectation = {
  arrowId: string
  side: TeamSide
  playerNumber: number
}

type LooseBallRelease = {
  scenarioId: string
  arrowId: string
  arrowType: string
}

const KNOWN_LOOSE_BALL_RELEASES: LooseBallRelease[] = [
  // This represents a loose turnover ball, not a clean player-controlled
  // release. The arrow names #8 as the turnover focus, but #8 is not at the
  // ball-start coordinate; resolving it needs an authored regain/loss touch.
  { scenarioId: 'protect-lead-in-back-five', arrowId: 'fuse-loose-pass', arrowType: 'pass' },
  // This progression starts from the original ball space after both wing-backs
  // have already advanced. Assigning a release player would require changing
  // the timing or adding an earlier support touch.
  { scenarioId: 'back-five-to-wing-back-attack', arrowId: 'wing-back-combine-central', arrowType: 'pass' },
]

function getScenario(id: string): ScenarioDefinition {
  const scenario = SCENARIOS.find((item) => item.id === id)

  assert.ok(scenario, `Expected scenario ${id} to exist`)

  return scenario
}

function buildPlanForScenario(scenario: ScenarioDefinition): ScenarioPlan {
  const formationPositions: FormationPositions = FORMATION_POSITIONS[scenario.formationMode]
  const awayFormationPositions: FormationPositions = OPPOSITION_POSITIONS[scenario.formationMode]

  return buildScenarioPlan(scenario, formationPositions, awayFormationPositions)
}

function getIntent(plan: ScenarioPlan, arrowId: string): ScheduledAnimationIntent {
  const intent = plan.animationIntents.find((item) => item.arrowId === arrowId)

  assert.ok(intent, `Expected intent ${arrowId} in scenario ${plan.scenarioId}`)

  return intent
}

function assertPointClose(actual: PitchPoint | undefined, expected: PitchPoint, context: string): void {
  assert.ok(actual, `${context}: expected a point`)
  assert.ok(
    Math.abs(actual.x - expected.x) <= EPSILON && Math.abs(actual.y - expected.y) <= EPSILON,
    `${context}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  )
}

function assertReleasePlayerAtBall(plan: ScenarioPlan, expectation: ReleaseExpectation): void {
  const intent = getIntent(plan, expectation.arrowId)
  const snapshot = getWorldSnapshotAtProgress(plan, intent.timing.startProgress)
  const player = snapshot.players.find(
    (item) => item.side === expectation.side && item.number === expectation.playerNumber,
  )

  assert.equal(intent.type, 'ball-movement', `${plan.scenarioId} ${intent.arrowId}: expected ball movement intent`)
  assert.equal(intent.releaseKind, 'player', `${plan.scenarioId} ${intent.arrowId}: release kind`)
  assert.deepEqual(
    intent.releasedBy,
    { side: expectation.side, playerNumber: expectation.playerNumber },
    `${plan.scenarioId} ${intent.arrowId}: release-player metadata`,
  )
  assertPointClose(
    snapshot.ball?.position,
    intent.from,
    `${plan.scenarioId} ${intent.arrowId}: ball at release space`,
  )
  assertPointClose(
    player?.position,
    intent.from,
    `${plan.scenarioId} ${intent.arrowId}: releasing ${expectation.side} #${expectation.playerNumber}`,
  )
}

function assertPlayerArrives(plan: ScenarioPlan, arrowId: string, side: TeamSide, playerNumber: number): void {
  const intent = getIntent(plan, arrowId)
  const snapshot = getWorldSnapshotAtProgress(plan, intent.timing.endProgress)
  const player = snapshot.players.find((item) => item.side === side && item.number === playerNumber)

  assert.equal(intent.type, 'player-movement', `${plan.scenarioId} ${intent.arrowId}: expected player movement intent`)
  assertPointClose(
    player?.position,
    intent.to,
    `${plan.scenarioId} ${intent.arrowId}: ${side} #${playerNumber} arrives`,
  )
}

function assertFinalBallAtIntentTarget(plan: ScenarioPlan, arrowId: string): void {
  const intent = getIntent(plan, arrowId)
  const snapshot = getWorldSnapshotAtProgress(plan, 1)

  assertPointClose(snapshot.ball?.position, intent.to, `${plan.scenarioId}: final ball target`)
}

function assertPhaseLabels(scenario: ScenarioDefinition, expectedLabels: string[]): void {
  assert.deepEqual(
    scenario.phaseSteps.map((step) => step.label),
    expectedLabels,
    `${scenario.id}: phase labels changed`,
  )
}

function getMarker(scenario: ScenarioDefinition, markerId: string): ScenarioMarker {
  const marker = scenario.markers?.find((item) => item.id === markerId)

  assert.ok(marker, `${scenario.id}: expected marker ${markerId}`)

  return marker
}

function assertMarkerAtIntentTarget(scenario: ScenarioDefinition, plan: ScenarioPlan, markerId: string, arrowId: string): void {
  const marker = getMarker(scenario, markerId)
  const intent = getIntent(plan, arrowId)

  assertPointClose(marker.point, intent.to, `${scenario.id}: marker ${markerId} matches ${arrowId}`)
}

function assertScenarioTextIncludes(scenario: ScenarioDefinition, terms: string[]): void {
  const searchableText = [
    scenario.strategy,
    scenario.description,
    ...scenario.tactics,
    ...scenario.coachingPoints,
    ...scenario.phaseSteps.map((step) => step.coachingCue),
  ].join(' ')

  terms.forEach((term) => {
    assert.ok(
      searchableText.includes(term),
      `${scenario.id}: expected scenario text to include "${term}"`,
    )
  })
}

function getLooseBallReleases(): LooseBallRelease[] {
  return SCENARIOS.flatMap((scenario) => {
    const plan = buildPlanForScenario(scenario)

    return plan.animationIntents
      .filter((intent) => intent.type === 'ball-movement' && intent.releaseKind === 'loose-ball')
      .map((intent) => ({
        scenarioId: scenario.id,
        arrowId: intent.arrowId,
        arrowType: intent.arrowType,
      }))
  })
}

test('build-through-wide-channels keeps #4 at the forward-pass release space and preserves the goal outcome', () => {
  const scenario = getScenario('build-through-wide-channels')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, ['Secure build-up', 'Release wide', 'Attack Zone 4', 'Finish'])
  assertPlayerArrives(plan, 'wide-build-four-step-to-release', 'home', 4)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-four-to-ten',
    side: 'home',
    playerNumber: 4,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-shot-goal',
    side: 'home',
    playerNumber: 9,
  })
  assertMarkerAtIntentTarget(scenario, plan, 'wide-build-goal-marker', 'wide-build-shot-goal')
  assertFinalBallAtIntentTarget(plan, 'wide-build-shot-goal')
})

test('loose-ball movement intents are explicitly tracked', () => {
  assert.deepEqual(
    getLooseBallReleases(),
    KNOWN_LOOSE_BALL_RELEASES,
    'New loose-ball movement intents should be explicitly documented here with an authoring decision.',
  )
})

test('every ball movement intent declares a release kind and follows its release metadata policy', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    plan.animationIntents
      .filter((intent) => intent.type === 'ball-movement')
      .forEach((intent) => {
        assert.ok(
          intent.releaseKind === 'player' || intent.releaseKind === 'loose-ball',
          `${scenario.id} ${intent.arrowId}: expected releaseKind to be player or loose-ball`,
        )

        if (intent.releaseKind === 'loose-ball') {
          assert.equal(
            intent.releasedBy,
            undefined,
            `${scenario.id} ${intent.arrowId}: loose-ball releases should not claim a release player`,
          )
          return
        }

        const releasedBy = intent.releasedBy

        assert.ok(releasedBy, `${scenario.id} ${intent.arrowId}: player releases require releasedBy metadata`)

        const snapshot = getWorldSnapshotAtProgress(plan, intent.timing.startProgress)
        const player = snapshot.players.find(
          (item) => item.side === releasedBy.side && item.number === releasedBy.playerNumber,
        )

        assert.ok(
          player,
          `${scenario.id} ${intent.arrowId}: releasing ${releasedBy.side} #${releasedBy.playerNumber} exists`,
        )
        assertPointClose(
          player.position,
          intent.from,
          `${scenario.id} ${intent.arrowId}: releasing ${releasedBy.side} #${releasedBy.playerNumber}`,
        )
        assertPointClose(
          snapshot.ball?.position,
          intent.from,
          `${scenario.id} ${intent.arrowId}: ball at release space`,
        )
      })
  })
})

test('corner-short-decoy-wide-delivery starts with #7 and the ball at the corner before the delivery and goal', () => {
  const scenario = getScenario('corner-short-decoy-wide-delivery')
  const plan = buildPlanForScenario(scenario)
  const initialSnapshot = getWorldSnapshotAtProgress(plan, 0)

  assertPhaseLabels(scenario, ['Show short', 'Deliver corridor', 'Finish corridor'])
  assertPointClose(initialSnapshot.ball?.position, { x: 2, y: 102 }, `${scenario.id}: ball starts at corner`)
  assertPointClose(
    initialSnapshot.players.find((item) => item.side === 'home' && item.number === 7)?.position,
    { x: 2, y: 102 },
    `${scenario.id}: #7 starts at corner`,
  )
  assertPlayerArrives(plan, 'corner-short-decoy', 'home', 7)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'corner-wide-delivery',
    side: 'home',
    playerNumber: 7,
  })
  assertPlayerArrives(plan, 'corner-nine-attack-corridor', 'home', 9)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'corner-shot-goal',
    side: 'home',
    playerNumber: 9,
  })
  assertMarkerAtIntentTarget(scenario, plan, 'corner-goal-marker', 'corner-shot-goal')
  assertFinalBallAtIntentTarget(plan, 'corner-shot-goal')
})

test('counter-quickly-on-turnover has #6 secure and release before #9 finishes into goal', () => {
  const scenario = getScenario('counter-quickly-on-turnover')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, ['Regain', 'Release runners', 'Finish'])
  assertPlayerArrives(plan, 'counter-six-secure-ball', 'home', 6)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-first-pass-forward',
    side: 'home',
    playerNumber: 6,
  })
  assertPlayerArrives(plan, 'counter-nine-check-to-finish', 'home', 9)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-shot-goal',
    side: 'home',
    playerNumber: 9,
  })
  assertMarkerAtIntentTarget(scenario, plan, 'counter-goal-marker', 'counter-shot-goal')
  assertFinalBallAtIntentTarget(plan, 'counter-shot-goal')
})

test('compact-defensive-block keeps away #7 at the wide release point and preserves the forced-back outcome', () => {
  const scenario = getScenario('compact-defensive-block')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, ['Opponent build-up', 'Protect middle', 'Force wide', 'Contain wide'])
  assertPlayerArrives(plan, 'compact-away-seven-receive-wide', 'away', 7)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'compact-opponent-forced-back',
    side: 'away',
    playerNumber: 7,
  })
  ;[
    'compact-two-step-wide',
    'compact-six-screen-inside',
    'compact-eight-screen-central',
    'compact-four-cover-slide',
    'compact-five-balance-slide',
    'compact-three-tuck-in',
    'compact-seven-block-switch',
    'compact-ten-shade-pivot',
    'compact-eleven-tuck-balance',
  ].forEach((arrowId) => assert.equal(getIntent(plan, arrowId).type, 'player-movement'))
  assertMarkerAtIntentTarget(scenario, plan, 'compact-contained-marker', 'compact-opponent-forced-back')
  assertFinalBallAtIntentTarget(plan, 'compact-opponent-forced-back')
  assertScenarioTextIncludes(scenario, ['DENY', 'DELAY', 'DIRECT', 'BALANCE'])
})

test('compact-defensive-block-opposite-side keeps away #11 at the wide release point and preserves the forced-back outcome', () => {
  const scenario = getScenario('compact-defensive-block-opposite-side')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, ['Opponent build-up', 'Protect middle', 'Force wide', 'Contain wide'])
  assertPlayerArrives(plan, 'compact-left-away-eleven-receive-wide', 'away', 11)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'compact-left-opponent-forced-back',
    side: 'away',
    playerNumber: 11,
  })
  ;[
    'compact-left-three-step-wide',
    'compact-left-six-screen-inside',
    'compact-left-eight-screen-central',
    'compact-left-four-cover-slide',
    'compact-left-five-balance-slide',
    'compact-left-two-tuck-in',
    'compact-left-eleven-block-switch',
    'compact-left-ten-shade-pivot',
    'compact-left-seven-tuck-balance',
  ].forEach((arrowId) => assert.equal(getIntent(plan, arrowId).type, 'player-movement'))
  assertMarkerAtIntentTarget(scenario, plan, 'compact-left-contained-marker', 'compact-left-opponent-forced-back')
  assertFinalBallAtIntentTarget(plan, 'compact-left-opponent-forced-back')
  assertScenarioTextIncludes(scenario, ['DENY', 'DELAY', 'DIRECT', 'BALANCE', 'CONTROL & RESTRAINT'])
})

test('central-denial-wide-trap denies central access before guiding wide and containing the opponent', () => {
  const scenario = getScenario('central-denial-wide-trap')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, ['Central threat', 'Guide wide', 'Wide trap', 'Contain wide'])
  assertReleasePlayerAtBall(plan, {
    arrowId: 'trap-opponent-five-to-ten',
    side: 'away',
    playerNumber: 5,
  })
  assertPlayerArrives(plan, 'trap-six-screen-central', 'home', 6)
  assertPlayerArrives(plan, 'trap-eight-screen-half-space', 'home', 8)
  assertPlayerArrives(plan, 'trap-ten-shade-pivot', 'home', 10)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'trap-opponent-ten-to-seven',
    side: 'away',
    playerNumber: 10,
  })
  assertPlayerArrives(plan, 'trap-away-seven-receive-wide', 'away', 7)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'trap-opponent-forced-back',
    side: 'away',
    playerNumber: 7,
  })
  ;[
    'trap-seven-block-switch',
    'trap-eleven-lock-inside',
    'trap-two-step-wide',
    'trap-five-cover-slide',
    'trap-four-balance-slide',
    'trap-three-tuck-in',
  ].forEach((arrowId) => assert.equal(getIntent(plan, arrowId).type, 'player-movement'))
  assertMarkerAtIntentTarget(scenario, plan, 'trap-contained-marker', 'trap-opponent-forced-back')
  assertFinalBallAtIntentTarget(plan, 'trap-opponent-forced-back')
  assertScenarioTextIncludes(scenario, ['DENY', 'DELAY', 'DIRECT', 'BALANCE', 'CONTROL & RESTRAINT'])
})
