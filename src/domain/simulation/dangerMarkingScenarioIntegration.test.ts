/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import { SCENARIOS } from '../../data/scenarios.ts'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations.ts'
import type { ScenarioDefinition } from '../scenarios/scenarioTypes.ts'
import { getNearestCoverDefender } from './dangerMarking.ts'
import type { DangerArea } from './dangerMarking.ts'
import { buildScenarioPlan, type FormationPositions } from './scenarioPlan.ts'
import { getWorldSnapshotAtProgress } from './worldSnapshot.ts'
import type { PlayerState, ScenarioPlan } from './worldTypes.ts'

const SAMPLE_PROGRESS_VALUES = [0, 0.25, 0.5, 0.75, 1]

const AWAY_PENALTY_BOX_DANGER_AREA: DangerArea = {
  id: 'away-penalty-box',
  defendingSide: 'away',
  minX: 24.84,
  maxX: 43.16,
  minY: 88.5,
  maxY: 105,
}

function buildPlanForScenario(scenario: ScenarioDefinition): ScenarioPlan {
  const formationPositions: FormationPositions = FORMATION_POSITIONS[scenario.formationMode]
  const awayFormationPositions: FormationPositions = OPPOSITION_POSITIONS[scenario.formationMode]

  return buildScenarioPlan(scenario, formationPositions, awayFormationPositions)
}

function getDistanceToArea(player: PlayerState, dangerArea: DangerArea): number {
  const nearestX = Math.max(dangerArea.minX, Math.min(player.position.x, dangerArea.maxX))
  const nearestY = Math.max(dangerArea.minY, Math.min(player.position.y, dangerArea.maxY))

  return Math.hypot(player.position.x - nearestX, player.position.y - nearestY)
}

test('getNearestCoverDefender returns a sensible away penalty-box cover suggestion for every real scenario snapshot', () => {
  SCENARIOS.forEach((scenario) => {
    const plan = buildPlanForScenario(scenario)

    SAMPLE_PROGRESS_VALUES.forEach((progress) => {
      const snapshot = getWorldSnapshotAtProgress(plan, progress)
      const awayPlayers = snapshot.players.filter((player) => player.side === 'away')
      const context = `scenario ${scenario.id} @ progress ${progress}`
      const suggestion = getNearestCoverDefender(snapshot, AWAY_PENALTY_BOX_DANGER_AREA)

      assert.ok(awayPlayers.length > 0, `${context}: expected away players`)
      assert.ok(suggestion, `${context}: expected a cover defender suggestion`)
      assert.equal(suggestion.defender.side, 'away', `${context}: suggested defender side`)

      const otherAwayPlayers = awayPlayers.filter((player) => player.id !== suggestion.defender.id)

      assert.ok(otherAwayPlayers.length > 0, `${context}: expected another away player for comparison`)
      assert.ok(
        otherAwayPlayers.some((player) => (
          suggestion.distanceToArea <= getDistanceToArea(player, AWAY_PENALTY_BOX_DANGER_AREA)
        )),
        `${context}: suggested away #${suggestion.defender.number} was not closer to the danger area than any other away player`,
      )
    })
  })
})
