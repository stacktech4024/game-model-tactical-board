import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PRESENTATION_PAGE_ORDER } from './pageOrder.ts'
import {
  HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID,
  HOW_WE_TRAIN_EXAMPLES,
  getHowWeTrainExample,
  splitHowWeTrainVisualScenario,
  type HowWeTrainExample,
} from './howWeTrainPageData.ts'

function getExample(id: HowWeTrainExample['id']) {
  return getHowWeTrainExample(id)
}

function getVisualPlayer(exampleId: HowWeTrainExample['id'], playerId: string) {
  const player = getExample(exampleId).visualScenario.players.find((item) => item.id === playerId)

  assert.ok(player, `${exampleId}: missing player ${playerId}`)
  return player
}

function getVisualStep(exampleId: HowWeTrainExample['id'], stepId: string) {
  const step = getExample(exampleId).visualScenario.steps.find((item) => item.id === stepId)

  assert.ok(step, `${exampleId}: missing step ${stepId}`)
  return step
}

function getMovementFacing(exampleId: HowWeTrainExample['id'], stepId: string, playerId: string) {
  const move = getVisualStep(exampleId, stepId).playerMoves?.find((item) => item.playerId === playerId)

  assert.ok(move, `${exampleId}/${stepId}: missing movement for ${playerId}`)
  assert.ok(Number.isFinite(move.facingAngle), `${exampleId}/${stepId}: missing movement facing for ${playerId}`)
  return move.facingAngle
}

function getStationaryFacing(exampleId: HowWeTrainExample['id'], stepId: string, playerId: string) {
  const facing = getVisualStep(exampleId, stepId).playerFacings?.find((item) => item.playerId === playerId)

  assert.ok(facing, `${exampleId}/${stepId}: missing stationary facing for ${playerId}`)
  return facing.facingAngle
}

function facingDifference(first: number, second: number) {
  return Math.abs(((first - second + 540) % 360) - 180)
}

function movementBearing(from: { x: number; y: number }, to: { x: number; y: number }) {
  return (Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI
}

test('How We Train exposes four approved examples with Central to Wide as the default', () => {
  assert.equal(HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID, 'central-wide')
  assert.deepEqual(
    HOW_WE_TRAIN_EXAMPLES.map((example) => [example.id, example.tabLabel]),
    [
      ['central-wide', 'Central → Wide'],
      ['wide-pressure', 'Wide Pressure'],
      ['press-regain', 'Press → Regain'],
      ['line-break-react', 'Line Break + React'],
    ],
  )
})

test('every example carries the complete Game Model to match-transfer chain and evidence fields', () => {
  HOW_WE_TRAIN_EXAMPLES.forEach((example) => {
    assert.ok(example.gameModelPrinciple.length > 0, `${example.id}: Game Model Principle`)
    assert.ok(example.positionalRequirement.length > 0, `${example.id}: Positional Requirement`)
    assert.ok(example.trainingDesign.length > 0, `${example.id}: Training Design`)
    assert.deepEqual(Object.keys(example.coachingDetail), ['who', 'what', 'when', 'where', 'why', 'how'])
    assert.ok(example.matchTransfer.length >= 4, `${example.id}: Match Transfer`)
    assert.ok(example.evidenceStrength, `${example.id}: evidence strength`)
    assert.equal(example.gameModelPrincipleEvidence, 'GAME MODEL REQUIREMENT')
    assert.ok(example.visualScenario.players.length > 0, `${example.id}: visual players`)
    assert.ok(example.visualScenario.steps.length > 0, `${example.id}: visual steps`)
    assert.ok(example.visualScenario.routes.length > 0, `${example.id}: visual routes`)
  })
})

test('MD+1 keeps confirmed load, format, methodology, and technical tactical reinforcement explicit', () => {
  const mdPlusOne = getExample('central-wide')
  const parameters = mdPlusOne.design.parameters.value

  assert.equal(mdPlusOne.sessionSource, 'MD+1')
  assert.match(parameters, /60–75 minutes/)
  assert.match(parameters, /RPE 2–3/)
  assert.equal(mdPlusOne.methodology, 'Whole')
  assert.equal(mdPlusOne.methodologyStatus, 'CONFIRMED')
  assert.equal(mdPlusOne.design.players.value, '6v6+2')
  assert.match(mdPlusOne.trainingDesign, /Recovery plus.*low-load technical\/tactical reinforcement/i)
  assert.doesNotMatch(mdPlusOne.trainingDesign, /only recovery|recovery\/video only/i)
})

test('Practice Session 5 and 8 examples keep unsupported setup details marked for confirmation', () => {
  const sessionExamples = HOW_WE_TRAIN_EXAMPLES.filter((example) => example.id !== 'central-wide')

  sessionExamples.forEach((example) => {
    assert.equal(example.methodologyStatus, 'RECOMMENDATION — COACH CONFIRMATION NEEDED')
    assert.equal(example.design.pitch.status, 'COACH CONFIRMATION NEEDED')
    assert.equal(example.design.parameters.status, 'COACH CONFIRMATION NEEDED')
    assert.equal(example.design.players.status, 'COACH CONFIRMATION NEEDED')
    assert.match(example.design.players.value, /exact formal player count.*Coach confirmation needed/i)
    assert.doesNotMatch(example.design.pitch.value, /\b\d+\s*[x×]\s*\d+\b/i)
    assert.doesNotMatch(example.design.players.value, /\b\d+v\d+\b/i)
    Object.values(example.demands).forEach((demand) => {
      assert.equal(demand.status, 'COACH CONFIRMATION NEEDED')
      assert.match(demand.value, /Coach confirmation needed/i)
    })
  })
})

test('the four examples map to the approved Moments of the Game', () => {
  assert.deepEqual(getExample('central-wide').moments, ['Attacking Organization'])
  assert.deepEqual(getExample('wide-pressure').moments, ['Defensive Organization'])
  assert.deepEqual(getExample('press-regain').moments, ['Defensive Organization', 'Attacking Transition'])
  assert.deepEqual(getExample('line-break-react').moments, ['Attacking Organization', 'Defensive Transition'])
})

test('profile references preserve the approved role relationships', () => {
  assert.deepEqual(
    getExample('central-wide').profileReferences.map((profile) => profile.profileId),
    ['goalkeeper', 'centre-backs', 'fullbacks', 'central-midfield', 'wide-players'],
  )
  assert.deepEqual(
    getExample('wide-pressure').profileReferences.map((profile) => profile.profileId),
    ['wide-players', 'fullbacks', 'central-midfield', 'centre-backs'],
  )
  assert.deepEqual(
    getExample('press-regain').profileReferences.map((profile) => profile.profileId),
    ['wide-players', 'striker', 'attacking-midfielder', 'central-midfield'],
  )
})

test('the Canada Soccer decision framework appears only for Press to Regain', () => {
  HOW_WE_TRAIN_EXAMPLES.filter((example) => example.id !== 'press-regain').forEach((example) => {
    assert.equal(example.decisionFramework, undefined)
  })

  assert.deepEqual(
    getExample('press-regain').decisionFramework?.map((item) => item.phase),
    ['PERCEIVE', 'DECIDE', 'EXECUTE', 'EVALUATE'],
  )
  assert.doesNotMatch(JSON.stringify(getExample('press-regain').decisionFramework), /CONCEIVE|DECEIVE/i)
})

test('How We Train is routed before Microcycle and Training Methodology', () => {
  const appSource = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8')

  assert.deepEqual(PRESENTATION_PAGE_ORDER.slice(-6), [
    'players',
    'skills',
    'how-we-train',
    'microcycle',
    'methodology',
    'closing',
  ])
  assert.equal(PRESENTATION_PAGE_ORDER.length, 16)
  assert.match(appSource, /path="\/presentation\/how-we-train"/)
  assert.match(appSource, /element=\{<HowWeTrainPage \/>\}/)
  assert.match(appSource, /path="\/presentation\/how-we-train\/examples"/)
  assert.match(appSource, /element=\{<HowWeTrainExamplesPage \/>\}/)
})

test('the overview reduces density and the supporting page preserves accessible example navigation', () => {
  const overviewSource = readFileSync(new URL('../pages/HowWeTrainPage.tsx', import.meta.url), 'utf8')
  const pageSource = readFileSync(new URL('../pages/HowWeTrainExamplesPage.tsx', import.meta.url), 'utf8')

  assert.match(overviewSource, /OUR TRAINING PROCESS/)
  assert.match(overviewSource, /Choose one practice to explore/)
  assert.match(overviewSource, /how-we-train\/examples\?example=/)
  assert.doesNotMatch(overviewSource, /<PixiPitchPreview/)
  assert.match(pageSource, /role="tablist"/)
  assert.match(pageSource, /role="tab"/)
  assert.match(pageSource, /role="tabpanel"/)
  assert.match(pageSource, /aria-selected=/)
  assert.match(pageSource, /aria-controls=/)
  assert.match(pageSource, /ArrowRight/)
  assert.match(pageSource, /ArrowLeft/)
  assert.match(pageSource, /event\.key === 'Home'/)
  assert.match(pageSource, /event\.key === 'End'/)
  assert.match(pageSource, /tabRefs\.current\[nextIndex\]\?\.focus\(\)/)
  assert.match(pageSource, /function TrainingPhaseCard/)
  assert.match(pageSource, /phase=\{visualPhases\[0\]\}/)
  assert.match(pageSource, /phase=\{visualPhases\[1\]\}/)
  assert.match(pageSource, /DIAGRAM \{index \+ 1\}/)
  assert.match(pageSource, /Red attacks · Zone 4/)
  assert.match(pageSource, /Red defends · Zone 1/)
  assert.match(pageSource, /Yellow #1 — coached GK/)
  assert.match(pageSource, /Cyan #1 — opposition GK/)
  assert.match(pageSource, /to="\/presentation\/players"/)
  assert.match(pageSource, /to="\/presentation\/skills"/)
  assert.match(pageSource, /<PresentationLayout pageId="how-we-train"/)
})

test('all player tokens use realistic role numbers with no N or A placeholders', () => {
  HOW_WE_TRAIN_EXAMPLES.forEach((example) => {
    const labelsByTeam = new Map<string, string[]>()

    example.visualScenario.players.forEach((player) => {
      assert.match(player.label, /^(?:[1-9]|10|11)$/, `${example.id}/${player.id}: shirt number`)
      const team = player.side === 'away' ? 'away' : 'home'
      labelsByTeam.set(team, [...(labelsByTeam.get(team) ?? []), player.label])
    })

    labelsByTeam.forEach((labels, team) => {
      assert.equal(new Set(labels).size, labels.length, `${example.id}/${team}: duplicate role number`)
    })
  })
})

test('both goalkeepers anchor the attacking direction and track the live ball picture', () => {
  HOW_WE_TRAIN_EXAMPLES.forEach((example) => {
    const goalkeepers = example.visualScenario.players.filter((player) => player.tone === 'keeper')
    const homeGoalkeeper = goalkeepers.find((player) => player.side === 'home')
    const awayGoalkeeper = goalkeepers.find((player) => player.side === 'away')

    assert.equal(goalkeepers.length, 2, `${example.id}: two goalkeeper anchors`)
    assert.ok(homeGoalkeeper, `${example.id}: coached goalkeeper`)
    assert.ok(awayGoalkeeper, `${example.id}: opposition goalkeeper`)
    assert.equal(homeGoalkeeper.label, '1')
    assert.equal(awayGoalkeeper.label, '1')
    assert.ok(homeGoalkeeper.y > 90, `${example.id}: coached goalkeeper anchors Zone 1`)
    assert.ok(awayGoalkeeper.y < 10, `${example.id}: opposition goalkeeper anchors Zone 4`)

    let liveBallPosition = example.visualScenario.ballPosition

    example.visualScenario.steps.forEach((step) => {
      liveBallPosition = step.ballTo ?? liveBallPosition

      ;[homeGoalkeeper, awayGoalkeeper].forEach((keeper) => {
        const facing = step.playerFacings?.find((item) => item.playerId === keeper.id)
        const expectedFacing = movementBearing(
          { x: keeper.x, y: keeper.y },
          liveBallPosition,
        )

        assert.ok(facing, `${example.id}/${step.id}: ${keeper.id} reorients`)
        assert.ok(
          facingDifference(facing.facingAngle, expectedFacing) <= 1,
          `${example.id}/${step.id}: ${keeper.id} faces the live ball picture`,
        )
      })
    })
  })
})

test('every opposition player has an authored body-orientation action in every step', () => {
  HOW_WE_TRAIN_EXAMPLES.forEach((example) => {
    const oppositionIds = example.visualScenario.players
      .filter((player) => player.side === 'away')
      .map((player) => player.id)

    example.visualScenario.steps.forEach((step) => {
      const orientedIds = new Set([
        ...(step.playerId && Number.isFinite(step.facingAngle) ? [step.playerId] : []),
        ...(step.playerMoves ?? []).filter((move) => Number.isFinite(move.facingAngle)).map((move) => move.playerId),
        ...(step.playerFacings ?? []).map((facing) => facing.playerId),
      ])

      oppositionIds.forEach((playerId) => {
        assert.ok(orientedIds.has(playerId), `${example.id}/${step.id}: missing opposition orientation for ${playerId}`)
      })
    })
  })
})

test('the second diagram begins from the first diagram final game state', () => {
  HOW_WE_TRAIN_EXAMPLES.forEach((example) => {
    const [firstPhase, secondPhase] = splitHowWeTrainVisualScenario(example.visualScenario)
    const splitIndex = Math.ceil(example.visualScenario.steps.length / 2)

    assert.deepEqual(firstPhase.steps, example.visualScenario.steps.slice(0, splitIndex))
    assert.deepEqual(secondPhase.steps, example.visualScenario.steps.slice(splitIndex))
    assert.equal(firstPhase.steps.length + secondPhase.steps.length, example.visualScenario.steps.length)

    const finalFirstBall = [...firstPhase.steps].reverse().find((step) => step.ballTo)?.ballTo
    if (finalFirstBall) assert.deepEqual(secondPhase.ballPosition, finalFirstBall)

    const expectedPositions = new Map(
      example.visualScenario.players.map((player) => [player.id, { x: player.x, y: player.y }]),
    )
    const expectedFacings = new Map(
      example.visualScenario.players.map((player) => [player.id, player.facingAngle]),
    )

    firstPhase.steps.forEach((step) => {
      if (step.playerId && step.playerTo) expectedPositions.set(step.playerId, step.playerTo)
      if (step.playerId && Number.isFinite(step.facingAngle)) expectedFacings.set(step.playerId, step.facingAngle)
      step.playerMoves?.forEach((move) => {
        expectedPositions.set(move.playerId, move.to)
        expectedFacings.set(move.playerId, move.facingAngle)
      })
      step.playerFacings?.forEach((facing) => expectedFacings.set(facing.playerId, facing.facingAngle))
    })

    secondPhase.players.forEach((player) => {
      const expectedPosition = expectedPositions.get(player.id)
      assert.deepEqual(
        { x: player.x, y: player.y, facingAngle: player.facingAngle },
        { x: expectedPosition?.x, y: expectedPosition?.y, facingAngle: expectedFacings.get(player.id) },
      )
    })
  })
})

test('every How We Train visual authors starting, carrier, movement, and stationary facing data', () => {
  HOW_WE_TRAIN_EXAMPLES.forEach((example) => {
    example.visualScenario.players.forEach((player) => {
      assert.ok(Number.isFinite(player.facingAngle), `${example.id}: starting facing for ${player.id}`)
    })

    const carrierSteps = example.visualScenario.steps.filter((step) => step.playerId)

    assert.ok(carrierSteps.length > 0, `${example.id}: carrier or receiver steps`)
    carrierSteps.forEach((step) => {
      assert.ok(Number.isFinite(step.facingAngle), `${example.id}/${step.id}: carrier or receiver facing`)
    })

    const movements = example.visualScenario.steps.flatMap((step) => step.playerMoves ?? [])

    assert.ok(movements.length > 0, `${example.id}: player movements`)
    movements.forEach((move) => {
      assert.ok(Number.isFinite(move.facingAngle), `${example.id}: movement facing for ${move.playerId}`)
    })

    assert.ok(
      example.visualScenario.steps.some((step) => (step.playerFacings?.length ?? 0) > 0),
      `${example.id}: stationary reorientation`,
    )
  })
})

test('Central to Wide shows open central reception, third-player vision, and wide preparation', () => {
  assert.equal(getVisualPlayer('central-wide', 'cw-6').facingAngle, -55)
  assert.equal(getVisualStep('central-wide', 'cw-circulate').facingAngle, 48)
  assert.equal(getVisualStep('central-wide', 'cw-third-player').facingAngle, 72)
  assert.equal(getMovementFacing('central-wide', 'cw-third-player', 'cw-2'), -107)
  assert.equal(getStationaryFacing('central-wide', 'cw-wide-release', 'cw-7'), 165)
  assert.equal(getVisualStep('central-wide', 'cw-wide-release').facingAngle, 8)
  assert.equal(getVisualStep('central-wide', 'cw-penetrate').facingAngle, 0)
})

test('Wide Pressure encodes inside-out pressure, half-turned cover, and the forced outside carrier', () => {
  assert.equal(getVisualPlayer('wide-pressure', 'wp-7').facingAngle, 90)
  assert.equal(getMovementFacing('wide-pressure', 'wp-press', 'wp-7'), 90)
  assert.equal(getMovementFacing('wide-pressure', 'wp-press', 'wp-2'), 50)
  assert.equal(getMovementFacing('wide-pressure', 'wp-press', 'wp-6'), 71)
  assert.notEqual(
    getMovementFacing('wide-pressure', 'wp-press', 'wp-7'),
    getMovementFacing('wide-pressure', 'wp-press', 'wp-2'),
  )
  assert.equal(getVisualStep('wide-pressure', 'wp-press').facingAngle, 90)
  assert.equal(getVisualStep('wide-pressure', 'wp-contain').facingAngle, 180)
  assert.equal(getStationaryFacing('wide-pressure', 'wp-contain', 'wp-4'), 68)
})

test('Press to Regain follows the carrier and changes #9 orientation between counter and retain pictures', () => {
  assert.deepEqual(
    ['pr-7', 'pr-9', 'pr-11'].map((id) => getVisualPlayer('press-regain', id).facingAngle),
    [53, -34, -63],
  )
  assert.deepEqual(
    ['pr-7', 'pr-9', 'pr-11'].map((id) => getMovementFacing('press-regain', 'pr-press', id)),
    [117, 172, -115],
  )
  assert.equal(getVisualStep('press-regain', 'pr-regain').facingAngle, 170)
  assert.equal(getStationaryFacing('press-regain', 'pr-counter-picture', 'pr-9'), -60)
  assert.equal(getStationaryFacing('press-regain', 'pr-retain-picture', 'pr-9'), -145)
  assert.ok(
    facingDifference(
      getStationaryFacing('press-regain', 'pr-counter-picture', 'pr-9'),
      getStationaryFacing('press-regain', 'pr-retain-picture', 'pr-9'),
    ) >= 80,
  )
  assert.equal(getMovementFacing('press-regain', 'pr-press', 'pr-6'), 37)
  assert.equal(getMovementFacing('press-regain', 'pr-press', 'pr-8'), -45)
})

test('Line Break and React opens the receiver, then turns pressure and cover toward the new carrier', () => {
  assert.equal(getVisualPlayer('line-break-react', 'lr-10').facingAngle, -70)
  assert.equal(getMovementFacing('line-break-react', 'lr-create', 'lr-10'), -60)
  assert.equal(getVisualStep('line-break-react', 'lr-break').facingAngle, 20)
  assert.equal(getStationaryFacing('line-break-react', 'lr-loss', 'lr-10'), 135)
  assert.equal(getStationaryFacing('line-break-react', 'lr-loss', 'lr-8'), -27)
  assert.equal(getMovementFacing('line-break-react', 'lr-react', 'lr-10'), 135)
  assert.equal(getMovementFacing('line-break-react', 'lr-react', 'lr-8'), 22)
})

test('large movement-facing differences are intentional football actions rather than stale defaults', () => {
  const intentionalLargeMismatches = new Set([
    'central-wide/cw-third-player/cw-2',
    'central-wide/cw-third-player/cw-7',
    'central-wide/cw-wide-release/cw-a4',
    'press-regain/pr-regain/pr-7',
    'line-break-react/lr-create/lr-10',
    'line-break-react/lr-create/lr-7',
    'line-break-react/lr-create/lr-9',
    'line-break-react/lr-break/lr-8',
    'line-break-react/lr-react/lr-8',
  ])
  const actualLargeMismatches: string[] = []

  HOW_WE_TRAIN_EXAMPLES.forEach((example) => {
    const positions = new Map(
      example.visualScenario.players.map((player) => [player.id, { x: player.x, y: player.y }]),
    )

    example.visualScenario.steps.forEach((step) => {
      step.playerMoves?.forEach((move) => {
        const from = positions.get(move.playerId)

        assert.ok(from, `${example.id}/${step.id}: missing position for ${move.playerId}`)
        assert.ok(Number.isFinite(move.facingAngle), `${example.id}/${step.id}: missing authored facing`)

        const distance = Math.hypot(move.to.x - from.x, move.to.y - from.y)
        const difference = facingDifference(
          movementBearing(from, move.to),
          move.facingAngle as number,
        )

        if (distance >= 5 && difference >= 55) {
          actualLargeMismatches.push(`${example.id}/${step.id}/${move.playerId}`)
        }

        positions.set(move.playerId, move.to)
      })

      if (step.playerId && step.playerTo) {
        positions.set(step.playerId, step.playerTo)
      }
    })
  })

  assert.deepEqual(new Set(actualLargeMismatches), intentionalLargeMismatches)
})
