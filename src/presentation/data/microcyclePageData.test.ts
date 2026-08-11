import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { HOW_WE_TRAIN_EXAMPLES } from './howWeTrainPageData.ts'
import {
  DEFAULT_MICROCYCLE_DAY_ID,
  INDIVIDUAL_DEVELOPMENT,
  MD_PLUS_ONE_EVIDENCE,
  MICROCYCLE_DAYS,
  PLAYER_READINESS_NOTE,
  WEEKLY_CONTEXT,
  getMicrocycleDay,
  type MicrocycleLoad,
} from './microcyclePageData.ts'
import { PRESENTATION_PAGE_ORDER } from './pageOrder.ts'

const LOAD_RANK: Record<MicrocycleLoad, number> = {
  REST: 0,
  LOW: 1,
  'LOW–MODERATE': 2,
  MODERATE: 2,
  HIGH: 3,
  MATCH: 4,
}

test('Microcycle uses one typed evidence-aware source and removes both old duplicate arrays', () => {
  const dataSource = readFileSync(new URL('./microcyclePageData.ts', import.meta.url), 'utf8')
  const methodologyDataSource = readFileSync(new URL('./methodology.ts', import.meta.url), 'utf8')
  const methodologyPageSource = readFileSync(new URL('../pages/MethodologyPage.tsx', import.meta.url), 'utf8')

  assert.match(dataSource, /export const MICROCYCLE_DAYS: MicrocycleDay\[\]/)
  assert.match(dataSource, /export type MicrocycleEvidenceStatus/)
  assert.doesNotMatch(methodologyDataSource, /MICROCYCLE|MicrocycleRow/)
  assert.doesNotMatch(methodologyPageSource, /MICROCYCLE|microcycle-timeline/)
})

test('the default current U20 week follows Sunday, Monday, Wednesday, Match, Saturday Rest', () => {
  assert.equal(DEFAULT_MICROCYCLE_DAY_ID, 'monday')
  assert.deepEqual(MICROCYCLE_DAYS.map((day) => day.id), ['sunday', 'monday', 'wednesday', 'match', 'saturday'])
  assert.deepEqual(WEEKLY_CONTEXT.teamTrainingDays, ['Sunday', 'Monday', 'Wednesday'])
  assert.equal(WEEKLY_CONTEXT.matchWindow, 'Thursday or Friday')
  assert.equal(WEEKLY_CONTEXT.normalMatchFrequency, 'One match per week')
  assert.match(WEEKLY_CONTEXT.defaultStructure, /no default double-match week/i)
})

test('calendar labels remain authoritative while match-relative context stays flexible', () => {
  assert.equal(getMicrocycleDay('sunday').day, 'Sunday')
  assert.match(getMicrocycleDay('sunday').calendarRelationship, /MD\+2.*MD\+3/)
  assert.equal(getMicrocycleDay('monday').day, 'Monday')
  assert.match(getMicrocycleDay('monday').calendarRelationship, /MD-3.*MD-4/)
  assert.equal(getMicrocycleDay('wednesday').day, 'Wednesday')
  assert.match(getMicrocycleDay('wednesday').calendarRelationship, /MD-1.*MD-2/)
  assert.equal(getMicrocycleDay('match').day, 'Thursday / Friday')
})

test('Monday is the highest physical-load team-training day', () => {
  const teamTrainingDays = MICROCYCLE_DAYS.filter((day) => day.isTeamFieldSession)
  const monday = getMicrocycleDay('monday')

  assert.equal(monday.physicalLoad.value, 'HIGH')
  assert.equal(monday.tacticalLoad.value, 'HIGH')
  assert.equal(monday.rpe.value, 'Planning RPE 6–8')
  assert.equal(monday.rpe.status, 'COACH-APPROVED PLANNING VALUE')
  teamTrainingDays.filter((day) => day.id !== 'monday').forEach((day) => {
    assert.ok(LOAD_RANK[monday.physicalLoad.value] > LOAD_RANK[day.physicalLoad.value])
  })
})

test('Sunday is a moderate re-entry and development session with readiness-based adjustment', () => {
  const sunday = getMicrocycleDay('sunday')

  assert.equal(sunday.role, 'Re-entry / Development')
  assert.equal(sunday.physicalLoad.value, 'MODERATE')
  assert.equal(sunday.rpe.value, 'Planning RPE 4–5')
  assert.match(sunday.whyThisDay, /without using the highest weekly physical load/i)
  assert.equal(sunday.readinessNote, PLAYER_READINESS_NOTE)
})

test('Wednesday is physically below Monday but explicitly tactically sharp', () => {
  const monday = getMicrocycleDay('monday')
  const wednesday = getMicrocycleDay('wednesday')
  const content = wednesday.sessionContent.join(' ')

  assert.ok(LOAD_RANK[wednesday.physicalLoad.value] < LOAD_RANK[monday.physicalLoad.value])
  assert.equal(wednesday.physicalLoad.value, 'LOW–MODERATE')
  assert.equal(wednesday.tacticalLoad.value, 'HIGH')
  assert.equal(wednesday.rpe.value, 'Planning RPE 3–4')
  assert.match(content, /activation/i)
  assert.match(content, /tactical rehearsal/i)
  assert.match(content, /team shape/i)
  assert.match(content, /set pieces/i)
  assert.doesNotMatch(content, /long-volume|conditioning/i)
})

test('Match Day and Saturday communicate competition transfer and rest accurately', () => {
  const match = getMicrocycleDay('match')
  const saturday = getMicrocycleDay('saturday')

  assert.equal(match.role, 'Match Day')
  assert.equal(match.physicalLoad.value, 'MATCH')
  assert.equal(match.tacticalLoad.value, 'MATCH')
  assert.match(match.gameModelFocus.join(' '), /full competitive pressure/i)
  assert.deepEqual(match.sessionContent, ['GAME MODEL', 'DECISION', 'EXECUTION', 'REVIEW'])
  assert.equal(saturday.role, 'Rest / Recovery')
  assert.equal(saturday.physicalLoad.value, 'REST')
  assert.match(saturday.sessionContent.join(' '), /No team field session normally/i)
  assert.doesNotMatch(`${saturday.role} ${saturday.sessionContent.join(' ')}`, /Match Day/i)
})

test('MD+1 evidence retains every confirmed load, format, method, and content boundary', () => {
  assert.equal(MD_PLUS_ONE_EVIDENCE.duration, '60–75 minutes')
  assert.equal(MD_PLUS_ONE_EVIDENCE.rpe, 'RPE 2–3')
  assert.equal(MD_PLUS_ONE_EVIDENCE.physicalLoad, 'LOW')
  assert.equal(MD_PLUS_ONE_EVIDENCE.methodology, 'Whole')
  assert.equal(MD_PLUS_ONE_EVIDENCE.format, '6v6+2')
  assert.match(MD_PLUS_ONE_EVIDENCE.constraints, /No tackling \/ heavy interceptions/)
  assert.match(MD_PLUS_ONE_EVIDENCE.use, /not a fixed Sunday label/i)
  assert.equal(MD_PLUS_ONE_EVIDENCE.status, 'DIRECT SESSION EVIDENCE')
})

test('Practice Sessions 8 and 5 remain evidence-backed and map to Monday main-load work', () => {
  const mondayEvidence = getMicrocycleDay('monday').sessionEvidence
  const practiceEight = mondayEvidence.filter((item) => /Practice Sessions? 8/.test(item.source))
  const practiceFive = mondayEvidence.filter((item) => /Practice Sessions?.*5/.test(item.source))

  assert.ok(practiceEight.length >= 2)
  assert.ok(practiceFive.length >= 2)
  ;[...practiceEight, ...practiceFive].forEach((item) => assert.equal(item.status, 'DIRECT SESSION EVIDENCE'))
})

test('all four How We Train examples have valid compact Microcycle references', () => {
  const approvedExampleIds = new Set(HOW_WE_TRAIN_EXAMPLES.map((example) => example.id))
  const referencedIds = new Set(
    MICROCYCLE_DAYS.flatMap((day) => day.sessionEvidence.flatMap((item) => item.exampleId ? [item.exampleId] : [])),
  )

  assert.deepEqual(referencedIds, approvedExampleIds)
})

test('individual development remains outside team sessions and readiness-aware', () => {
  assert.match(INDIVIDUAL_DEVELOPMENT.running, /5–10 km.*outside team training/i)
  assert.match(INDIVIDUAL_DEVELOPMENT.gym, /at least 2 gym sessions/i)
  assert.match(INDIVIDUAL_DEVELOPMENT.modification, /injury status.*readiness.*team load/i)
  assert.equal(INDIVIDUAL_DEVELOPMENT.status, 'COACH-CONFIRMED CURRENT PRACTICE')
  assert.doesNotMatch(JSON.stringify(INDIVIDUAL_DEVELOPMENT), /squat|deadlift|sets|reps/i)
})

test('readiness language modifies load without inventing medical clearance rules', () => {
  assert.match(PLAYER_READINESS_NOTE, /returning from injury|carrying a knock/i)
  assert.match(PLAYER_READINESS_NOTE, /medical\/performance process/i)
  assert.doesNotMatch(PLAYER_READINESS_NOTE, /medical clearance|return-to-play protocol/i)
})

test('the current U20 presentation contains no stale formation, age-group, or placeholder framing', () => {
  const currentPresentation = JSON.stringify({ WEEKLY_CONTEXT, MICROCYCLE_DAYS, MD_PLUS_ONE_EVIDENCE })

  assert.doesNotMatch(currentPresentation, /1-4-3-3/i)
  assert.doesNotMatch(currentPresentation, /\bU15\b/i)
  assert.doesNotMatch(currentPresentation, /CURRENT APP PLACEHOLDER/i)
  assert.doesNotMatch(currentPresentation, /Apply the model/i)
})

test('every critical planning field exposes an allowed field-level evidence status', () => {
  const allowedStatuses = new Set([
    'DIRECT SESSION EVIDENCE',
    'COACH-CONFIRMED CURRENT PRACTICE',
    'COACH-APPROVED PLANNING VALUE',
    'CANADA SOCCER FRAMEWORK',
    'COACH CONFIRMATION NEEDED',
  ])

  MICROCYCLE_DAYS.forEach((day) => {
    ;[day.physicalLoad, day.rpe, day.tacticalLoad, day.primaryMoments, day.methodology].forEach((field) => {
      assert.ok(allowedStatuses.has(field.status), `${day.id}: ${field.status}`)
    })
    day.sessionEvidence.forEach((evidence) => assert.ok(allowedStatuses.has(evidence.status)))
  })
})

test('Microcycle uses exact Canada Soccer Moment terminology', () => {
  const allowedMoments = new Set([
    'Attacking Organization',
    'Defensive Organization',
    'Attacking Transition',
    'Defensive Transition',
  ])

  MICROCYCLE_DAYS.flatMap((day) => [...day.primaryMoments.value, ...day.secondaryMoments]).forEach((moment) => {
    assert.ok(allowedMoments.has(moment), moment)
  })
})

test('the dedicated route is ordered between How We Train and Training Methodology', () => {
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
  assert.match(appSource, /path="\/presentation\/microcycle"/)
  assert.match(appSource, /element=\{<MicrocyclePage \/>\}/)
})

test('the page exposes accessible day tabs, focus movement, evidence labels, and non-color load text', () => {
  const pageSource = readFileSync(new URL('../pages/MicrocyclePage.tsx', import.meta.url), 'utf8')

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
  assert.match(pageSource, /<strong>\{field\.value\}<\/strong>/)
  assert.match(pageSource, /microcycle-evidence-label/)
})

test('projector-first source renders one selected day and keeps individual work secondary', () => {
  const pageSource = readFileSync(new URL('../pages/MicrocyclePage.tsx', import.meta.url), 'utf8')

  assert.match(pageSource, /const activeDay = getMicrocycleDay\(activeDayId\)/)
  assert.match(pageSource, /WHY THIS SESSION, ON THIS DAY\?/)
  assert.match(pageSource, /microcycle-support-column/)
  assert.equal((pageSource.match(/INDIVIDUAL DEVELOPMENT/g) ?? []).length, 1)
  assert.equal((pageSource.match(/className="microcycle-day-card"/g) ?? []).length, 1)
})
