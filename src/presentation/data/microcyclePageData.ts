import type { HowWeTrainExampleId, TrainingMoment } from './howWeTrainPageData.ts'

export type MicrocycleDayId = 'sunday' | 'monday' | 'wednesday' | 'match' | 'saturday'

export type MicrocycleEvidenceStatus =
  | 'DIRECT SESSION EVIDENCE'
  | 'COACH-CONFIRMED CURRENT PRACTICE'
  | 'COACH-APPROVED PLANNING VALUE'
  | 'CANADA SOCCER FRAMEWORK'
  | 'COACH CONFIRMATION NEEDED'

export type MicrocycleLoad = 'LOW' | 'LOW–MODERATE' | 'MODERATE' | 'HIGH' | 'MATCH' | 'REST'

export type EvidenceValue<T> = {
  value: T
  status: MicrocycleEvidenceStatus
}

export type MicrocycleSessionEvidence = {
  title: string
  source: string
  status: MicrocycleEvidenceStatus
  detail: string
  exampleId?: HowWeTrainExampleId
}

export type MicrocycleDay = {
  id: MicrocycleDayId
  day: string
  ribbonLabel: string
  role: string
  calendarRelationship: string
  physicalLoad: EvidenceValue<MicrocycleLoad>
  rpe: EvidenceValue<string>
  tacticalLoad: EvidenceValue<MicrocycleLoad>
  objective: EvidenceValue<string>
  duration: EvidenceValue<string>
  primaryMoments: EvidenceValue<TrainingMoment[]>
  secondaryMoments: TrainingMoment[]
  gameModelFocus: string[]
  primaryUnits: string[]
  secondaryUnits: string[]
  sessionType: EvidenceValue<string>
  methodology: EvidenceValue<string>
  activityTypes: EvidenceValue<string[]>
  sessionContent: string[]
  sessionEvidence: MicrocycleSessionEvidence[]
  whyThisDay: string
  matchTransfer: string
  readinessNote: string
  skillDevelopment: string[]
  isTeamFieldSession: boolean
}

const confirmed = <T>(value: T): EvidenceValue<T> => ({
  value,
  status: 'COACH-CONFIRMED CURRENT PRACTICE',
})

const planning = <T>(value: T): EvidenceValue<T> => ({
  value,
  status: 'COACH-APPROVED PLANNING VALUE',
})

const framework = <T>(value: T): EvidenceValue<T> => ({
  value,
  status: 'CANADA SOCCER FRAMEWORK',
})

export const PLAYER_READINESS_NOTE =
  'Training load is modified for players returning from injury or carrying a knock, within the club’s appropriate medical/performance process.'

export const RPE_GUIDANCE = {
  scale: 'Session RPE uses the player-reported 1–10 scale after each session.',
  loadCalculation: 'Basic session load = duration in minutes × player session RPE.',
  review: 'Review trends alongside minutes, attendance, wellness check-ins, and coach observation.',
  planningBoundary: 'Planning ranges are targets; the recorded response is reported by the player.',
} as const

export const WEEKLY_CONTEXT = {
  teamTrainingDays: ['Sunday', 'Monday', 'Wednesday'],
  matchWindow: 'Thursday or Friday',
  normalMatchFrequency: 'One match per week',
  saturday: 'Usually rest',
  defaultStructure: '2–3 team training sessions before one match; no default double-match week',
} as const

export const AO_MICROCYCLE_FOCUS = {
  moment: 'Attacking Organization' as const,
  geography: 'Zones 2–3 into Zone 4 · Channels 1–2',
  gameProblem: 'When central pressure closes the forward lane, we can keep forcing the middle instead of releasing the free wide player.',
  strategy: 'Circulate through the central unit to draw the opponent narrow, then switch diagonally and progress wide.',
  tactic: '#7/#11 fixes the wide defender, #2/#3 overlaps on the release cue, and #9 attacks the central finishing lane while the far-side winger and #8/#10 complete the box occupation.',
  matchOutcome: 'Recognize central closed → release wide → overlap → enter Zone 4 → cross, cutback, combine, or reset.',
} as const

export const MD_PLUS_ONE_EVIDENCE = {
  title: 'MD+1 evidence model',
  use: 'Used when the first session follows closely after Match Day; it is not a fixed Sunday label.',
  status: 'DIRECT SESSION EVIDENCE' as const,
  duration: '60–75 minutes',
  rpe: 'RPE 2–3',
  physicalLoad: 'LOW' as const,
  methodology: 'Whole',
  format: '6v6+2',
  constraints: 'No tackling / heavy interceptions',
  content: [
    'High touch volume',
    'Scanning and body shape',
    'First touch and one/two-touch play',
    'Line breaking and third-player release',
    'Central-to-wide recognition',
    'Wide combination / finishing incentives',
  ],
}

export const INDIVIDUAL_DEVELOPMENT = {
  title: 'Individual Development / Outside Team Training',
  status: 'COACH-CONFIRMED CURRENT PRACTICE' as const,
  running: '5–10 km weekly independent running outside team training hours',
  gym: 'Recommended at least 2 gym sessions per week',
  modification: 'Individual work is adjusted for injury status, readiness, and team load.',
}

export const MICROCYCLE_DAYS: MicrocycleDay[] = [
  {
    id: 'sunday',
    day: 'Sunday',
    ribbonLabel: 'SUN',
    role: 'AO Re-entry / Recognition',
    calendarRelationship: 'Typical relation to the previous match: MD+2 after Friday or MD+3 after Thursday.',
    physicalLoad: confirmed('MODERATE'),
    rpe: planning('Planning RPE 4–5'),
    tacticalLoad: confirmed('MODERATE'),
    objective: planning('Restore football rhythm and reintroduce the Attacking Organization picture: circulate in Zones 2–3, recognize central closed, and release the free wide player.'),
    duration: planning('60–75 minutes'),
    primaryMoments: framework(['Attacking Organization']),
    secondaryMoments: [],
    gameModelFocus: [
      AO_MICROCYCLE_FOCUS.gameProblem,
      'Zones 2–3 — central circulation, scanning, and third-player support',
      'Channels 1–2 — recognize and prepare the wide release',
    ],
    primaryUnits: ['#4/#5', '#6/#8/#10', '#2/#3', '#7/#11'],
    secondaryUnits: ['#9 finishing reference'],
    sessionType: planning('Recovery Session (RS) + Skill Set Session (SS)'),
    methodology: planning('Whole / game-related environment'),
    activityTypes: planning([
      'Three-part warm-up',
      '5v2 rondo / technical circulation',
      '4v4v4 central-to-wide possession',
      'Small-Sided Game (SSG) — 6v6+2',
    ]),
    sessionContent: [
      'Reintroduce the same AO picture at a controlled load',
      'Scan before receiving and keep the next action visible',
      'Recognize the free wide player without turning the session into a pressing drill',
    ],
    sessionEvidence: [
      {
        title: 'Central → Wide · 6v6+2',
        source: 'Module 26 Micro Cycle Session Plan MD+1',
        status: 'DIRECT SESSION EVIDENCE',
        detail: '50m × 35m Whole game, goalkeeper restarts, central-to-wide recognition, high touch volume, and a controlled physical demand.',
        exampleId: 'central-wide',
      },
      {
        title: 'MD+1 evidence boundary',
        source: 'Module 26 Micro Cycle Session Plan MD+1',
        status: 'DIRECT SESSION EVIDENCE',
        detail: 'When the session is truly MD+1: 60–75 minutes, RPE 2–3, LOW load, Whole methodology, and no tackling or heavy interceptions.',
      },
    ],
    whyThisDay: 'Restore rhythm and perception first so Monday can add opposition pressure, speed, and repeated full-team actions without reteaching the picture.',
    matchTransfer: 'Players arrive on Monday already recognizing central closed, the diagonal switch, and the wide receiver’s first picture.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Scanning before receiving', 'Open body shape', 'Passing weight', 'Central-to-wide recognition'],
    isTeamFieldSession: true,
  },
  {
    id: 'monday',
    day: 'Monday',
    ribbonLabel: 'MON',
    role: 'AO Main Development',
    calendarRelationship: 'Typical relation to the next match: MD-3 for Thursday or MD-4 for Friday.',
    physicalLoad: confirmed('HIGH'),
    rpe: planning('Planning RPE 6–8'),
    tacticalLoad: confirmed('HIGH'),
    objective: planning('Solve the AO game problem under match pressure: draw the opponent centrally, release #2/#3 around #7/#11, and coordinate the Zone 4 finish with #9.'),
    duration: planning('90 minutes'),
    primaryMoments: framework(['Attacking Organization']),
    secondaryMoments: [],
    gameModelFocus: [
      AO_MICROCYCLE_FOCUS.strategy,
      AO_MICROCYCLE_FOCUS.tactic,
      'Both teams remain live: the opponent protects the centre, shifts wide, covers depth, and recovers toward goal',
    ],
    primaryUnits: ['#2/#3 + #7/#11 wide relationship', '#9 central target', '#6/#8/#10 central unit'],
    secondaryUnits: ['#1/#4/#5 circulation and rest defence'],
    sessionType: planning('Tactical Training (TT)'),
    methodology: planning('Whole-Part-Whole / opposed game-related practice'),
    activityTypes: planning([
      'Three-part warm-up',
      'Small-Sided Game (SSG)',
      'Functional Practice — fullback / winger / #9 relationship',
      'Phase of Play',
      'Expanded Play (9v9 / 11v11)',
    ]),
    sessionContent: [
      'Whole — expose the central-closed AO problem with direction, opposition, and scoring',
      'Part — rehearse #7/#11 fixing, #2/#3 overlap timing, #9 movement, and far-side box occupation',
      'Whole — return to 9v9 / 11v11 and score only when the decision survives realistic pressure',
    ],
    sessionEvidence: [
      {
        title: 'Central → Wide main-load progression',
        source: 'Module 26 session evidence + AO Capping Game Model',
        status: 'COACH-APPROVED PLANNING VALUE',
        detail: 'Progress the confirmed 6v6+2 picture into functional unit work, phase of play, and expanded play while preserving the same cues and player relationships.',
        exampleId: 'central-wide',
      },
      {
        title: 'Fullback / winger / striker relationship',
        source: 'AO Game Analysis + Skill Development',
        status: 'COACH-APPROVED PLANNING VALUE',
        detail: '#7/#11 fixes the wide defender, #2/#3 overlaps after the release cue, and #9 attacks the central service while the far side and #8/#10 complete the box.',
      },
    ],
    whyThisDay: 'Monday is furthest from the next match, so it carries the week’s highest physical and decision-making load and the longest opposed AO rehearsal.',
    matchTransfer: AO_MICROCYCLE_FOCUS.matchOutcome,
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Fullback overlap timing', 'Winger fixation / inside support', '#9 near-post and central movement', 'Cross / cutback / reset decision'],
    isTeamFieldSession: true,
  },
  {
    id: 'wednesday',
    day: 'Wednesday',
    ribbonLabel: 'WED',
    role: 'AO Match Rehearsal',
    calendarRelationship: 'MD-1 for a Thursday match or MD-2 for a Friday match.',
    physicalLoad: confirmed('LOW–MODERATE'),
    rpe: planning('Planning RPE 3–4'),
    tacticalLoad: confirmed('HIGH'),
    objective: planning('Sharpen the AO match pattern at game speed with low volume: circulate, recognize central closed, release wide, and complete the correct Zone 4 action.'),
    duration: planning('60–75 minutes (MD-1) / up to 90 minutes (MD-2)'),
    primaryMoments: framework(['Attacking Organization']),
    secondaryMoments: [],
    gameModelFocus: [
      'Opponent-specific pressure picture and the free-player cue',
      '#2/#3, #7/#11, #9, and #8/#10 timing in the final action',
      'Cross, cutback, combination, or reset based on the live Zone 4 picture',
    ],
    primaryUnits: ['Starting back line and central unit', '#2/#3 + #7/#11', '#9 + far-side and edge-of-box runners'],
    secondaryUnits: ['Goalkeeper distribution', 'Rest-defence support'],
    sessionType: planning('Tactical Training (TT) + Video Analysis Session (VA)'),
    methodology: planning('Whole-Part-Whole / phase of play / activation'),
    activityTypes: planning([
      'Video analysis / tactical board',
      'Three-part warm-up / activation',
      'Phase of Play — AO Zones 2–3 into 4',
      'Short 11v11 tactical rehearsal',
      'Light finishing from crosses and cutbacks',
    ]),
    sessionContent: [
      'Brief video / tactical-board reminder of the same AO game problem',
      'Short, sharp activation with scanning and body orientation',
      'Tactical rehearsal of team shape, wide release, overlap, and coordinated box occupation',
      'Low-volume finishing and reset decisions from the Zone 4 picture',
    ],
    sessionEvidence: [
      {
        title: 'AO match-plan rehearsal',
        source: 'Current weekly practice + AO Capping Game Model',
        status: 'COACH-APPROVED PLANNING VALUE',
        detail: 'Lower physical volume with high concentration, full opposition movement, game-speed timing, and clear role cues for the selected AO pattern.',
        exampleId: 'central-wide',
      },
    ],
    whyThisDay: 'Reduce physical volume while preserving the perception, timing, and execution speed required to recognize the same AO picture in the match.',
    matchTransfer: 'The starting unit enters Match Day with one shared cue chain and more than one valid Zone 4 solution.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Scanning under match pressure', 'Release-pass timing', 'Overlap at game speed', 'Box movement', 'Final-action selection'],
    isTeamFieldSession: true,
  },
  {
    id: 'match',
    day: 'Thursday / Friday',
    ribbonLabel: 'THU / FRI',
    role: 'Match Day · AO Transfer',
    calendarRelationship: 'One competitive match per week; no double-match structure is presented as the default.',
    physicalLoad: confirmed('MATCH'),
    rpe: framework('Expected RPE 9–10; collect post-match rating'),
    tacticalLoad: confirmed('MATCH'),
    objective: planning('Execute and evaluate Attacking Organization from Zones 2–3 into Zone 4 under full competitive pressure.'),
    duration: framework('90 minutes + warm-up'),
    primaryMoments: framework(['Attacking Organization']),
    secondaryMoments: [],
    gameModelFocus: [
      AO_MICROCYCLE_FOCUS.gameProblem,
      AO_MICROCYCLE_FOCUS.matchOutcome,
      'Evaluate the decision, timing, and final action under full competitive pressure against the live opponent and score state',
    ],
    primaryUnits: ['Starting eleven', '#2/#3 + #7/#11 + #9 relationship', '#6/#8/#10 support'],
    secondaryUnits: ['Substitutes / finishers'],
    sessionType: confirmed('Competition / Match'),
    methodology: confirmed('Competition / Match'),
    activityTypes: framework(['11v11 Match']),
    sessionContent: ['AO GAME PROBLEM', 'RECOGNIZE', 'DECIDE', 'EXECUTE', 'REVIEW'],
    sessionEvidence: [
      {
        title: 'Competitive AO transfer',
        source: 'Current OPL U20 weekly pattern',
        status: 'COACH-CONFIRMED CURRENT PRACTICE',
        detail: 'The match tests whether the week’s central-to-wide behaviours survive full pressure and produce a useful Zone 4 action.',
      },
    ],
    whyThisDay: 'Competition is the transfer and evaluation environment for the single weekly AO objective.',
    matchTransfer: 'Game problem → recognition → decision → execution → review.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Execute the trained AO relationships under competition pressure'],
    isTeamFieldSession: false,
  },
  {
    id: 'saturday',
    day: 'Saturday',
    ribbonLabel: 'SAT',
    role: 'Rest / Recovery',
    calendarRelationship: 'Usually rest after the Thursday or Friday match.',
    physicalLoad: confirmed('REST'),
    rpe: confirmed('RPE 0 — no team session'),
    tacticalLoad: confirmed('REST'),
    objective: planning('Protect physical and mental freshness before the next AO learning cycle.'),
    duration: confirmed('No team session'),
    primaryMoments: framework([]),
    secondaryMoments: [],
    gameModelFocus: ['Recovery', 'Readiness', 'Review the AO match outcome without adding field load'],
    primaryUnits: ['No team field session normally'],
    secondaryUnits: [],
    sessionType: confirmed('Rest Day (RST)'),
    methodology: confirmed('Rest / individual recovery'),
    activityTypes: confirmed(['Rest Day (RST)', 'Optional individual recovery only when appropriate']),
    sessionContent: ['No team field session normally', 'Recovery and readiness', 'Coach review of the AO transfer outcome'],
    sessionEvidence: [
      {
        title: 'Saturday rest',
        source: 'Current weekly practice',
        status: 'COACH-CONFIRMED CURRENT PRACTICE',
        detail: 'Saturday is not presented as Match Day or an assumed active team-training day.',
      },
    ],
    whyThisDay: 'Protect readiness after competition and before the next Sunday AO re-entry session.',
    matchTransfer: 'Recovery and review inform the next AO game problem without creating another physical session.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Optional individual responsibilities only when appropriate'],
    isTeamFieldSession: false,
  },
]

export const DEFAULT_MICROCYCLE_DAY_ID: MicrocycleDayId = 'monday'

export function getMicrocycleDay(id: MicrocycleDayId): MicrocycleDay {
  return MICROCYCLE_DAYS.find((day) => day.id === id) ?? MICROCYCLE_DAYS[0]
}
