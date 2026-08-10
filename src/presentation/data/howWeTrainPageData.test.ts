import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PRESENTATION_PAGE_ORDER } from './pageOrder.ts'
import {
  HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID,
  HOW_WE_TRAIN_EXAMPLES,
  getHowWeTrainExample,
  type HowWeTrainExample,
} from './howWeTrainPageData.ts'

function getExample(id: HowWeTrainExample['id']) {
  return getHowWeTrainExample(id)
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

test('How We Train is routed and ordered between Skill Development and Training Methodology', () => {
  const appSource = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8')

  assert.deepEqual(PRESENTATION_PAGE_ORDER.slice(-5), [
    'players',
    'skills',
    'how-we-train',
    'methodology',
    'closing',
  ])
  assert.equal(PRESENTATION_PAGE_ORDER.length, 15)
  assert.match(appSource, /path="\/presentation\/how-we-train"/)
  assert.match(appSource, /element=\{<HowWeTrainPage \/>\}/)
})

test('the page implements accessible keyboard tabs, remounts visuals, and links to Profiles and Skills', () => {
  const pageSource = readFileSync(new URL('../pages/HowWeTrainPage.tsx', import.meta.url), 'utf8')

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
  assert.match(pageSource, /key=\{activeExample\.id\}/)
  assert.match(pageSource, /to="\/presentation\/players"/)
  assert.match(pageSource, /to="\/presentation\/skills"/)
  assert.match(pageSource, /<PresentationLayout pageId="how-we-train"/)
})
