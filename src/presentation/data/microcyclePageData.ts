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
    role: 'Re-entry / Development',
    calendarRelationship: 'Typical relation to the previous match: MD+2 after Friday or MD+3 after Thursday.',
    physicalLoad: confirmed('MODERATE'),
    rpe: planning('Planning RPE 4–5'),
    tacticalLoad: confirmed('MODERATE'),
    objective: planning('Restore football rhythm and reinforce Attacking Organization through central-to-wide decisions at a controlled load.'),
    duration: planning('60–90 minutes by player pathway'),
    primaryMoments: framework(['Attacking Organization']),
    secondaryMoments: ['Defensive Transition'],
    gameModelFocus: [
      'Zone 1 — Build Up into Zone 2 — Unbalance',
      'Line-breaking and central-to-wide recognition',
      'Receiving preparation, body shape, and unit relationships',
    ],
    primaryUnits: ['#4/#5', '#6/#8/#10', 'Fullbacks', 'Wide Players'],
    secondaryUnits: ['#9 / finishing support'],
    sessionType: planning('Recovery Session (RS) + Skill Set Session (SS)'),
    methodology: planning('Whole / game-related environment'),
    activityTypes: planning([
      'Recovery / light technical for high-minute players',
      'Technical rondos',
      'Small-Sided Game (SSG) for the development group',
    ]),
    sessionContent: [
      'Reintroduce football rhythm',
      'Correct and reinforce Game Model behaviours',
      'Meaningful technical/tactical repetition at controlled load',
    ],
    sessionEvidence: [
      {
        title: 'Central → Wide',
        source: 'MD+1 session model',
        status: 'DIRECT SESSION EVIDENCE',
        detail: 'Re-entry option when proximity to the previous match and player readiness support it.',
        exampleId: 'central-wide',
      },
      {
        title: 'Line Break + React',
        source: 'Practice Session 5',
        status: 'DIRECT SESSION EVIDENCE',
        detail: 'Sunday option only when opposition and transition demands remain moderate.',
        exampleId: 'line-break-react',
      },
    ],
    whyThisDay: 'Restore football rhythm and develop the Game Model without using the highest weekly physical load.',
    matchTransfer: 'Cleaner receiving pictures and connected progression choices carry into Monday’s main-load work.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Scanning', 'Receiving open', 'Central-to-wide release'],
    isTeamFieldSession: true,
  },
  {
    id: 'monday',
    day: 'Monday',
    ribbonLabel: 'MON',
    role: 'Main Development / Game Model Day',
    calendarRelationship: 'Typical relation to the next match: MD-3 for Thursday or MD-4 for Friday.',
    physicalLoad: confirmed('HIGH'),
    rpe: planning('Planning RPE 6–8'),
    tacticalLoad: confirmed('HIGH'),
    objective: planning('Solve the week’s highest-demand defensive organization and transition problems under opposition and scoring.'),
    duration: planning('90 minutes'),
    primaryMoments: framework([
      'Defensive Organization',
      'Attacking Transition',
      'Defensive Transition',
    ]),
    secondaryMoments: ['Attacking Organization'],
    gameModelFocus: [
      'Pressure, cover, balance, and collective compactness',
      'Regain recognition: counter or retain',
      'Opposed line-breaking with immediate transition',
    ],
    primaryUnits: ['#7/#9/#11', '#6/#8/#10', 'Fullbacks'],
    secondaryUnits: ['Covering Centre Back', 'Goalkeeper'],
    sessionType: planning('Tactical Training (TT)'),
    methodology: planning('Whole-Part-Whole / opposed game-related practice'),
    activityTypes: planning([
      'Small-Sided Game (SSG)',
      'Phase of Play',
      'Expanded Play (9v9 / 11v11)',
    ]),
    sessionContent: [
      'Most demanding collective and unit work of the week',
      'Real opposition, direction, transition, and scoring problems',
      'High physical and decision-making demand',
    ],
    sessionEvidence: [
      {
        title: 'Wide Pressure / Force Outside',
        source: 'Practice Session 8',
        status: 'DIRECT SESSION EVIDENCE',
        detail: 'Primary defensive organization example for the main-load day.',
        exampleId: 'wide-pressure',
      },
      {
        title: 'Press → Regain',
        source: 'Practice Sessions 8 + 5',
        status: 'DIRECT SESSION EVIDENCE',
        detail: 'Collective press followed by the counter-or-retain decision.',
        exampleId: 'press-regain',
      },
      {
        title: 'Line Break + React',
        source: 'Practice Session 5',
        status: 'DIRECT SESSION EVIDENCE',
        detail: 'Preferred Monday placement when opposition and transition demand is high.',
        exampleId: 'line-break-react',
      },
    ],
    whyThisDay: 'Monday is furthest from the next match and is the approved highest-load team-training day.',
    matchTransfer: 'Players solve the week’s hardest tactical problems before physical volume reduces toward competition.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Pressure angle', '1v1 defending', 'Line-breaking', 'Pressing initiation'],
    isTeamFieldSession: true,
  },
  {
    id: 'wednesday',
    day: 'Wednesday',
    ribbonLabel: 'WED',
    role: 'Match Preparation / Tactical Sharpness',
    calendarRelationship: 'MD-1 for a Thursday match or MD-2 for a Friday match.',
    physicalLoad: confirmed('LOW–MODERATE'),
    rpe: planning('Planning RPE 3–4'),
    tacticalLoad: confirmed('HIGH'),
    objective: planning('Clarify match-plan roles, team shape, set pieces, and selected transition cues without accumulating fatigue.'),
    duration: planning('60–75 minutes (MD-1) / up to 90 minutes (MD-2)'),
    primaryMoments: framework(['Attacking Organization', 'Defensive Organization']),
    secondaryMoments: ['Attacking Transition', 'Defensive Transition'],
    gameModelFocus: [
      'Match-specific team shape and role clarity',
      'Attacking and defending patterns with selected transition cues',
      'Set pieces and restart responsibilities',
    ],
    primaryUnits: ['Starting unit', 'Unit relationships', 'Set-piece groups'],
    secondaryUnits: ['Finishers', 'Rest defence', 'Goalkeepers'],
    sessionType: planning('Tactical Training (TT) + Video Analysis Session (VA)'),
    methodology: planning('Whole-Part-Whole / phase of play / activation'),
    activityTypes: planning([
      'Video analysis / tactical board',
      'Phase of Play',
      'Set Pieces',
      'Rondos / light finishing',
    ]),
    sessionContent: [
      'Brief video / tactical-board review',
      'Short, sharp activation',
      'Tactical rehearsal and team shape',
      'Set pieces and match-specific preparation',
    ],
    sessionEvidence: [
      {
        title: 'Match-plan rehearsal',
        source: 'Current weekly practice',
        status: 'COACH-CONFIRMED CURRENT PRACTICE',
        detail: 'Lower physical volume with high concentration, execution speed, and tactical clarity.',
      },
    ],
    whyThisDay: 'Reduce physical volume while preserving the tactical clarity and execution speed required for Match Day.',
    matchTransfer: 'Players arrive with clear team-shape, restart, and role cues rather than accumulated conditioning fatigue.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Finishing sharpness', 'Passing speed', 'Receiving preparation', 'Set-piece role execution'],
    isTeamFieldSession: true,
  },
  {
    id: 'match',
    day: 'Thursday / Friday',
    ribbonLabel: 'THU / FRI',
    role: 'Match Day',
    calendarRelationship: 'One competitive match per week; no double-match structure is presented as the default.',
    physicalLoad: confirmed('MATCH'),
    rpe: framework('Expected RPE 9–10; collect post-match rating'),
    tacticalLoad: confirmed('MATCH'),
    objective: planning('Execute and evaluate the weekly Game Model under full competitive pressure.'),
    duration: framework('90 minutes + warm-up'),
    primaryMoments: framework([
      'Attacking Organization',
      'Defensive Organization',
      'Attacking Transition',
      'Defensive Transition',
    ]),
    secondaryMoments: [],
    gameModelFocus: [
      'Execute the weekly Game Model focus under full competitive pressure',
      'Recognize the Moment, geography, and role requirement',
      'Adapt decisions to the live opponent and score state',
    ],
    primaryUnits: ['Starting eleven', 'All positional units'],
    secondaryUnits: ['Substitutes / finishers'],
    sessionType: confirmed('Competition / Match'),
    methodology: confirmed('Competition / Match'),
    activityTypes: framework(['11v11 Match']),
    sessionContent: ['GAME MODEL', 'DECISION', 'EXECUTION', 'REVIEW'],
    sessionEvidence: [
      {
        title: 'Competitive transfer',
        source: 'Current OPL U20 weekly pattern',
        status: 'COACH-CONFIRMED CURRENT PRACTICE',
        detail: 'The match tests whether the week’s trained behaviours survive full pressure.',
      },
    ],
    whyThisDay: 'Competition is the transfer environment for the weekly Game Model objective.',
    matchTransfer: 'Game Model → Decision → Execution → Review.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Execute role-specific actions under competition pressure'],
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
    objective: planning('Protect physical and mental freshness before the next weekly cycle.'),
    duration: confirmed('No team session'),
    primaryMoments: framework([]),
    secondaryMoments: [],
    gameModelFocus: ['Recovery', 'Readiness', 'Personal responsibilities as appropriate'],
    primaryUnits: ['No team field session normally'],
    secondaryUnits: [],
    sessionType: confirmed('Rest Day (RST)'),
    methodology: confirmed('Rest / individual recovery'),
    activityTypes: confirmed(['Rest Day (RST)', 'Optional individual recovery only when appropriate']),
    sessionContent: ['No team field session normally', 'Recovery and readiness', 'Personal responsibilities as appropriate'],
    sessionEvidence: [
      {
        title: 'Saturday rest',
        source: 'Current weekly practice',
        status: 'COACH-CONFIRMED CURRENT PRACTICE',
        detail: 'Saturday is not presented as Match Day or an assumed active team-training day.',
      },
    ],
    whyThisDay: 'Protect readiness after competition and before the next Sunday re-entry/development session.',
    matchTransfer: 'Recovery supports availability and quality for the next weekly cycle.',
    readinessNote: PLAYER_READINESS_NOTE,
    skillDevelopment: ['Optional individual responsibilities only when appropriate'],
    isTeamFieldSession: false,
  },
]

export const DEFAULT_MICROCYCLE_DAY_ID: MicrocycleDayId = 'monday'

export function getMicrocycleDay(id: MicrocycleDayId): MicrocycleDay {
  return MICROCYCLE_DAYS.find((day) => day.id === id) ?? MICROCYCLE_DAYS[0]
}
