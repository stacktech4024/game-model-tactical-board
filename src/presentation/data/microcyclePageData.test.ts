import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  AO_MICROCYCLE_FOCUS,
  DEFAULT_MICROCYCLE_DAY_ID,
  INDIVIDUAL_DEVELOPMENT,
  MD_PLUS_ONE_EVIDENCE,
  MICROCYCLE_DAYS,
  PLAYER_READINESS_NOTE,
  RPE_GUIDANCE,
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

  assert.equal(sunday.role, 'AO Re-entry / Recognition')
  assert.equal(sunday.physicalLoad.value, 'MODERATE')
  assert.equal(sunday.rpe.value, 'Planning RPE 4–5')
  assert.match(sunday.objective.value, /Attacking Organization.*Zones 2–3.*release the free wide player/i)
  assert.match(sunday.whyThisDay, /Monday.*opposition pressure/i)
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
  assert.match(content, /wide release.*overlap.*box occupation/i)
  assert.doesNotMatch(content, /set pieces|Defensive Organization|transition/i)
  assert.doesNotMatch(content, /long-volume|conditioning/i)
})

test('Match Day and Saturday communicate competition transfer and rest accurately', () => {
  const match = getMicrocycleDay('match')
  const saturday = getMicrocycleDay('saturday')

  assert.match(match.role, /^Match Day/)
  assert.equal(match.physicalLoad.value, 'MATCH')
  assert.equal(match.tacticalLoad.value, 'MATCH')
  assert.match(match.rpe.value, /9–10/)
  assert.match(match.gameModelFocus.join(' '), /full competitive pressure/i)
  assert.deepEqual(match.sessionContent, ['AO GAME PROBLEM', 'RECOGNIZE', 'DECIDE', 'EXECUTE', 'REVIEW'])
  assert.equal(saturday.role, 'Rest / Recovery')
  assert.equal(saturday.physicalLoad.value, 'REST')
  assert.match(saturday.rpe.value, /RPE 0/)
  assert.match(saturday.sessionContent.join(' '), /No team field session normally/i)
  assert.doesNotMatch(`${saturday.role} ${saturday.sessionContent.join(' ')}`, /Match Day/i)
})

test('every day includes all six evaluator-required Microcycle fields', () => {
  MICROCYCLE_DAYS.forEach((day) => {
    assert.ok(day.primaryMoments.value)
    assert.ok(day.objective.value.trim(), `${day.id}: objective`)
    assert.ok(day.duration.value.trim(), `${day.id}: duration`)
    assert.ok(day.rpe.value.trim(), `${day.id}: RPE`)
    assert.ok(day.methodology.value.trim(), `${day.id}: methodology`)
    assert.ok(day.activityTypes.value.length > 0, `${day.id}: activity types`)
  })
})

test('activity and session types use the Canada Soccer course taxonomy across the week', () => {
  const weeklyPlan = JSON.stringify(MICROCYCLE_DAYS)

  assert.match(weeklyPlan, /Small-Sided Game \(SSG\)/)
  assert.match(weeklyPlan, /Recovery Session \(RS\)/)
  assert.match(weeklyPlan, /Video Analysis Session \(VA\)/)
  assert.match(weeklyPlan, /Tactical Training \(TT\)/)
  assert.match(weeklyPlan, /Rest Day \(RST\)/)
  assert.match(weeklyPlan, /11v11 Match/)
})

test('RPE guidance separates planning targets from the player-reported response and basic load', () => {
  assert.match(RPE_GUIDANCE.scale, /player-reported 1–10.*after each session/i)
  assert.match(RPE_GUIDANCE.loadCalculation, /duration in minutes × player session RPE/i)
  assert.match(RPE_GUIDANCE.review, /minutes.*attendance.*wellness.*coach observation/i)
  assert.match(RPE_GUIDANCE.planningBoundary, /Planning ranges are targets.*reported by the player/i)
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

test('the evaluator Microcycle uses the confirmed Module 26 AO evidence and approved main-load progression', () => {
  const sundayEvidence = getMicrocycleDay('sunday').sessionEvidence
  const mondayEvidence = getMicrocycleDay('monday').sessionEvidence

  assert.ok(sundayEvidence.some((item) => /Module 26/.test(item.source) && item.status === 'DIRECT SESSION EVIDENCE'))
  assert.ok(mondayEvidence.some((item) => item.exampleId === 'central-wide' && item.status === 'COACH-APPROVED PLANNING VALUE'))
  assert.doesNotMatch(JSON.stringify(MICROCYCLE_DAYS), /Practice Session 5|Practice Session 8|wide-pressure|press-regain|line-break-react/i)
})

test('the evaluator Microcycle references only the AO Central to Wide training example', () => {
  const referencedIds = new Set(
    MICROCYCLE_DAYS.flatMap((day) => day.sessionEvidence.flatMap((item) => item.exampleId ? [item.exampleId] : [])),
  )

  assert.deepEqual(referencedIds, new Set(['central-wide']))
})

test('every field-session day advances one AO Zones 2–3 into Zone 4 problem', () => {
  assert.equal(AO_MICROCYCLE_FOCUS.moment, 'Attacking Organization')
  assert.match(AO_MICROCYCLE_FOCUS.geography, /Zones 2–3 into Zone 4/)

  MICROCYCLE_DAYS.filter((day) => day.isTeamFieldSession).forEach((day) => {
    assert.deepEqual(day.primaryMoments.value, ['Attacking Organization'], day.id)
    assert.deepEqual(day.secondaryMoments, [], day.id)
    assert.match(`${day.objective.value} ${day.gameModelFocus.join(' ')}`, /central|wide|Zone 4|Attacking Organization/i, day.id)
  })
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
    ;[day.physicalLoad, day.rpe, day.tacticalLoad, day.objective, day.duration, day.primaryMoments, day.sessionType, day.methodology, day.activityTypes].forEach((field) => {
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

test('the overview and day-detail routes are ordered between How We Train and Training Methodology', () => {
  const appSource = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8')

  assert.deepEqual(PRESENTATION_PAGE_ORDER.slice(-10), [
    'players',
    'skills',
    'how-we-train',
    'how-we-train-session',
    'how-we-train-pictures',
    'how-we-train-transfer',
    'microcycle',
    'microcycle-detail',
    'methodology',
    'closing',
  ])
  assert.equal(PRESENTATION_PAGE_ORDER.length, 22)
  assert.match(appSource, /path="\/presentation\/microcycle"/)
  assert.match(appSource, /element=\{<MicrocyclePage \/>\}/)
  assert.match(appSource, /path="\/presentation\/microcycle-detail"/)
  assert.match(appSource, /element=\{<MicrocycleDetailPage \/>\}/)
})

test('the detail page exposes accessible day tabs, focus movement, and non-color load text', () => {
  const pageSource = readFileSync(new URL('../pages/MicrocycleDetailPage.tsx', import.meta.url), 'utf8')

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
})

test('the weekly overview and selected-day detail split projector content across two pages', () => {
  const overviewSource = readFileSync(new URL('../pages/MicrocyclePage.tsx', import.meta.url), 'utf8')
  const detailSource = readFileSync(new URL('../pages/MicrocycleDetailPage.tsx', import.meta.url), 'utf8')

  assert.match(overviewSource, /microcycle-week-grid/)
  assert.match(overviewSource, /View day plan/)
  assert.match(overviewSource, /Moment.*Objective.*Duration.*RPE.*Session methodology.*Activity types/s)
  assert.match(detailSource, /const activeDay = getMicrocycleDay\(activeDayId\)/)
  assert.match(detailSource, /WHY THIS SESSION, ON THIS DAY\?/)
  assert.match(detailSource, /<dt>Objective<\/dt>/)
  assert.match(detailSource, /<span>Duration<\/span>/)
  assert.match(detailSource, /<span>RPE<\/span>/)
  assert.match(detailSource, /<dt>Session methodology<\/dt>/)
  assert.match(detailSource, /<dt>Activity types<\/dt>/)
  assert.match(detailSource, /microcycle-detail-support/)
  assert.equal((detailSource.match(/INDIVIDUAL DEVELOPMENT/g) ?? []).length, 1)
  assert.equal((detailSource.match(/className="microcycle-day-card"/g) ?? []).length, 1)
})

test('presented Microcycle pages omit internal evidence-status labels', () => {
  const overviewSource = readFileSync(new URL('../pages/MicrocyclePage.tsx', import.meta.url), 'utf8')
  const detailSource = readFileSync(new URL('../pages/MicrocycleDetailPage.tsx', import.meta.url), 'utf8')
  const presentedSource = `${overviewSource}\n${detailSource}`

  assert.doesNotMatch(presentedSource, /EvidenceLabel|microcycle-evidence-label/)
  assert.doesNotMatch(presentedSource, /DIRECT SESSION EVIDENCE/)
  assert.doesNotMatch(presentedSource, /COACH-(?:CONFIRMED|APPROVED)/)
})
