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

const KNOWN_LOOSE_BALL_RELEASES: LooseBallRelease[] = []

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

test('build-through-wide-channels connects every release from #1 through #9 and preserves the goal outcome', () => {
  const scenario = getScenario('build-through-wide-channels')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, [
    'Start with the goalkeeper',
    'Find the left fullback',
    'Connect the winger',
    'Connect the third player',
    'Find the attacking midfielder',
    'Release the striker',
    'Finish in Zone 4',
  ])
  assertPlayerArrives(plan, 'wide-build-three-advance', 'home', 3)
  assertPlayerArrives(plan, 'wide-build-six-support', 'home', 6)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-gk-to-four',
    side: 'home',
    playerNumber: 1,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-four-to-three',
    side: 'home',
    playerNumber: 4,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-three-to-eleven',
    side: 'home',
    playerNumber: 3,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-eleven-to-six',
    side: 'home',
    playerNumber: 11,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-six-to-ten',
    side: 'home',
    playerNumber: 6,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-ten-to-nine',
    side: 'home',
    playerNumber: 10,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'wide-build-shot-goal',
    side: 'home',
    playerNumber: 9,
  })

  const finalPass = getIntent(plan, 'wide-build-ten-to-nine')
  const releaseSnapshot = getWorldSnapshotAtProgress(plan, finalPass.timing.startProgress)
  const numberNine = releaseSnapshot.players.find(
    (player) => player.side === 'home' && player.number === 9,
  )
  const trackingCentreBack = releaseSnapshot.players.find(
    (player) => player.side === 'away' && player.number === 5,
  )
  const secondLastOpponentY = releaseSnapshot.players
    .filter((player) => player.side === 'away')
    .map((player) => player.position.y)
    .sort((a, b) => b - a)[1]

  assert.ok(numberNine, 'Expected home #9 at the AO final-pass release')
  assert.ok(trackingCentreBack, 'Expected away #5 tracking the AO final-pass run')
  assert.ok(
    numberNine.position.y <= secondLastOpponentY,
    `AO final pass: #9 at y=${numberNine.position.y} must be onside of the second-last opponent at y=${secondLastOpponentY}`,
  )
  assert.ok(
    numberNine.position.y < trackingCentreBack.position.y,
    `AO final pass: #9 at y=${numberNine.position.y} needs a visible margin behind tracking #5 at y=${trackingCentreBack.position.y}`,
  )

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

test('corner-short-decoy-wide-delivery moves from #7 to #3, then #2 heads across for #8 to score', () => {
  const scenario = getScenario('corner-short-decoy-wide-delivery')
  const plan = buildPlanForScenario(scenario)
  const initialSnapshot = getWorldSnapshotAtProgress(plan, 0)

  assertPhaseLabels(scenario, ['Show short', 'Organize the box', 'Deliver far post', 'Head back across', 'Finish second header'])
  assertPointClose(initialSnapshot.ball?.position, { x: 2, y: 102 }, `${scenario.id}: ball starts at corner`)
  assertPointClose(
    initialSnapshot.players.find((item) => item.side === 'home' && item.number === 7)?.position,
    { x: 2, y: 102 },
    `${scenario.id}: #7 starts at corner`,
  )
  assertPlayerArrives(plan, 'corner-three-show-short', 'home', 3)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'corner-short-pass',
    side: 'home',
    playerNumber: 7,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'corner-wide-delivery',
    side: 'home',
    playerNumber: 3,
  })
  assertPlayerArrives(plan, 'corner-two-attack-back-post', 'home', 2)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'corner-two-header-across',
    side: 'home',
    playerNumber: 2,
  })
  assertPlayerArrives(plan, 'corner-eight-late-arrival', 'home', 8)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'corner-eight-header-goal',
    side: 'home',
    playerNumber: 8,
  })
  assertMarkerAtIntentTarget(scenario, plan, 'corner-goal-marker', 'corner-eight-header-goal')
  assertFinalBallAtIntentTarget(plan, 'corner-eight-header-goal')
})

test('counter-quickly-on-turnover shows opponent possession, a central interception, and a complete counter', () => {
  const scenario = getScenario('counter-quickly-on-turnover')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, [
    'Opponent circulates',
    'Opponent finds pivot',
    'Win the turnover',
    'First forward action',
    'Release the channel',
    'Cross before reset',
    'Finish the counter',
  ])
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-away-five-to-four',
    side: 'away',
    playerNumber: 5,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-away-four-to-six',
    side: 'away',
    playerNumber: 4,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-away-six-central-pass',
    side: 'away',
    playerNumber: 6,
  })
  assertPlayerArrives(plan, 'counter-eight-intercept', 'home', 8)
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-eight-to-ten',
    side: 'home',
    playerNumber: 8,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-ten-release-seven',
    side: 'home',
    playerNumber: 10,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-seven-cross',
    side: 'home',
    playerNumber: 7,
  })
  assertReleasePlayerAtBall(plan, {
    arrowId: 'counter-shot-goal',
    side: 'home',
    playerNumber: 9,
  })
  assertMarkerAtIntentTarget(scenario, plan, 'counter-goal-marker', 'counter-shot-goal')
  assertFinalBallAtIntentTarget(plan, 'counter-shot-goal')
})

test('main attacking scenarios include believable away off-ball defensive movement', () => {
  ;[
    {
      scenarioId: 'build-through-wide-channels',
      arrowIds: [
        'wide-build-away-eleven-press',
        'wide-build-away-six-shift',
        'wide-build-away-five-track-nine',
        'wide-build-away-two-tuck',
      ],
    },
    {
      scenarioId: 'counter-quickly-on-turnover',
      arrowIds: [
        'counter-away-ten-first-pressure',
        'counter-away-six-cover-forward',
        'counter-away-two-recover-outside',
        'counter-away-five-track-nine',
      ],
    },
    {
      scenarioId: 'corner-short-decoy-wide-delivery',
      arrowIds: [
        'corner-away-three-step-short',
        'corner-away-four-near-post',
        'corner-away-two-back-post',
        'corner-away-five-track-nine',
      ],
    },
  ].forEach(({ scenarioId, arrowIds }) => {
    const plan = buildPlanForScenario(getScenario(scenarioId))

    arrowIds.forEach((arrowId) => {
      const intent = getIntent(plan, arrowId)

      assert.equal(intent.type, 'player-movement', `${scenarioId} ${arrowId}: expected player movement`)
      assert.equal(intent.side, 'away', `${scenarioId} ${arrowId}: expected away movement`)
      assertPlayerArrives(plan, arrowId, 'away', intent.playerNumber!)
    })
  })
})

test('5-second fuse shows possession, the loss, two pressure actions, and recovery into the block', () => {
  const scenario = getScenario('protect-lead-in-back-five')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, [
    'Possess before the loss',
    'Progress possession',
    'Possession turns over',
    'First pressure',
    'Follow the escape pass',
    'Recover the block',
  ])
  ;[
    { arrowId: 'fuse-five-to-six', side: 'home', playerNumber: 5 },
    { arrowId: 'fuse-six-to-eight', side: 'home', playerNumber: 6 },
    { arrowId: 'fuse-eight-risk-pass', side: 'home', playerNumber: 8 },
    { arrowId: 'fuse-away-eight-to-ten', side: 'away', playerNumber: 8 },
    { arrowId: 'fuse-away-ten-back-to-six', side: 'away', playerNumber: 10 },
    { arrowId: 'fuse-away-six-escape-five', side: 'away', playerNumber: 6 },
  ].forEach((expectation) => {
    assertReleasePlayerAtBall(plan, expectation as ReleaseExpectation)
  })

  assertPlayerArrives(plan, 'fuse-away-eight-intercept', 'away', 8)
  assertPlayerArrives(plan, 'fuse-eight-first-press', 'home', 8)
  assertPlayerArrives(plan, 'fuse-eight-follow-pass', 'home', 8)

  ;[
    ['fuse-three-recover-line', 3],
    ['fuse-four-recover-line', 4],
    ['fuse-five-recover-line', 5],
    ['fuse-two-recover-line', 2],
    ['fuse-eleven-recover-midfield', 11],
    ['fuse-eight-recover-midfield', 8],
    ['fuse-six-recover-midfield', 6],
    ['fuse-seven-recover-midfield', 7],
    ['fuse-ten-recover-front', 10],
    ['fuse-nine-recover-front', 9],
  ].forEach(([arrowId, playerNumber]) => {
    assertPlayerArrives(plan, arrowId as string, 'home', playerNumber as number)
  })

  assert.deepEqual(getLooseBallReleases(), KNOWN_LOOSE_BALL_RELEASES)
  assertScenarioTextIncludes(scenario, ['five seconds', 'press', 'recover'])
})

test('compact block denies the centre, moves as a unit, regains the forced return, and scores', () => {
  const scenario = getScenario('defensive-block-force-wide')
  const plan = buildPlanForScenario(scenario)

  assertPhaseLabels(scenario, [
    'Opponent begins the build',
    'Deny the central progression',
    'Force the recycle',
    'Opponent goes wide',
    'Press the wide receiver',
    'Win the inside return',
    'Attack after the regain',
    'Connect the striker',
    'Finish the regain',
  ])
  ;[
    { arrowId: 'do-away-one-to-five', side: 'away', playerNumber: 1 },
    { arrowId: 'do-away-five-to-eight', side: 'away', playerNumber: 5 },
    { arrowId: 'do-away-eight-back-to-five', side: 'away', playerNumber: 8 },
    { arrowId: 'do-away-five-to-two', side: 'away', playerNumber: 5 },
    { arrowId: 'do-away-two-to-seven', side: 'away', playerNumber: 2 },
    { arrowId: 'do-away-seven-inside-pass', side: 'away', playerNumber: 7 },
    { arrowId: 'do-eight-to-ten', side: 'home', playerNumber: 8 },
    { arrowId: 'do-ten-to-nine', side: 'home', playerNumber: 10 },
    { arrowId: 'do-shot-goal', side: 'home', playerNumber: 9 },
  ].forEach((expectation) => {
    assertReleasePlayerAtBall(plan, expectation as ReleaseExpectation)
  })
  assertPlayerArrives(plan, 'do-three-shift-unit', 'home', 3)
  assertPlayerArrives(plan, 'do-three-continue-shift', 'home', 3)
  assertPlayerArrives(plan, 'do-eight-intercept', 'home', 8)
  assertMarkerAtIntentTarget(scenario, plan, 'do-goal-marker', 'do-shot-goal')
  assertFinalBallAtIntentTarget(plan, 'do-shot-goal')
  assertScenarioTextIncludes(scenario, ['compact', 'centre', 'force', 'regain'])
})
