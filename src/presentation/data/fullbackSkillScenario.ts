export type FullbackScenarioPoint = {
  x: number
  y: number
}

export type FullbackScenarioPlayer = {
  id: string
  label: string
  role: string
  start: FullbackScenarioPoint
  tone?: 'primary' | 'keeper' | 'opponent'
}

export type FullbackScenarioStep = {
  id: string
  cue: string
  kind: 'pass' | 'run' | 'cross'
  ballFrom?: FullbackScenarioPoint
  ballTo?: FullbackScenarioPoint
  playerId?: string
  playerTo?: FullbackScenarioPoint
  duration: number
  /** Player to pulse-emphasize immediately before this step's main cue, e.g. a scan or press moment. */
  emphasizePlayerId?: string
  /** Cue shown during the emphasis pulse; falls back to the step's main cue if omitted. */
  emphasisCue?: string
}

export type FullbackScenarioLegendItem = {
  markClass: 'pass' | 'run' | 'cross'
  label: string
}

export type FullbackSkillScenarioData = {
  players: FullbackScenarioPlayer[]
  ballStart: FullbackScenarioPoint
  steps: FullbackScenarioStep[]
  caption: string
  legend: FullbackScenarioLegendItem[]
}

export type FullbackSkillVariant = 'in-possession' | 'out-of-possession' | 'transition'

const IN_POSSESSION_SCENARIO: FullbackSkillScenarioData = {
  players: [
    {
      id: 'goalkeeper',
      label: '1',
      role: 'Goalkeeper',
      start: { x: 50, y: 82 },
      tone: 'keeper',
    },
    {
      id: 'six',
      label: '6',
      role: 'Central support',
      start: { x: 33, y: 68 },
    },
    {
      id: 'ten',
      label: '10',
      role: 'Link / switch',
      start: { x: 51, y: 52 },
    },
    {
      id: 'winger',
      label: '7',
      role: 'Wide receiver',
      start: { x: 83, y: 39 },
    },
    {
      id: 'fullback',
      label: '2',
      role: 'Wide-channel release',
      start: { x: 82, y: 61 },
    },
    {
      id: 'nine',
      label: '9',
      role: 'Finishing space',
      start: { x: 52, y: 18 },
    },
  ],
  ballStart: { x: 33, y: 68 },
  steps: [
    {
      id: 'six-to-ten',
      cue: 'Link',
      kind: 'pass',
      ballFrom: { x: 33, y: 68 },
      ballTo: { x: 54, y: 50 },
      duration: 0.85,
    },
    {
      id: 'ten-to-winger',
      cue: 'Wide release',
      kind: 'pass',
      ballFrom: { x: 54, y: 50 },
      ballTo: { x: 80, y: 36 },
      duration: 0.95,
    },
    {
      id: 'fullback-run',
      cue: 'Overlap',
      kind: 'run',
      playerId: 'fullback',
      playerTo: { x: 82, y: 48 },
      duration: 0.95,
      emphasizePlayerId: 'fullback',
      emphasisCue: 'Scan & time',
    },
    {
      id: 'winger-to-fullback',
      cue: 'Combine',
      kind: 'pass',
      ballFrom: { x: 80, y: 36 },
      ballTo: { x: 79, y: 46 },
      duration: 0.7,
    },
    {
      id: 'fullback-to-nine',
      cue: 'Final ball',
      kind: 'cross',
      ballFrom: { x: 79, y: 46 },
      ballTo: { x: 56, y: 22 },
      duration: 1,
    },
    {
      id: 'nine-attack',
      cue: 'Attack space',
      kind: 'run',
      playerId: 'nine',
      playerTo: { x: 52, y: 15 },
      ballTo: { x: 53, y: 16 },
      duration: 0.45,
    },
    {
      id: 'finish-goal',
      cue: 'Finish',
      kind: 'pass',
      ballFrom: { x: 53, y: 16 },
      ballTo: { x: 52, y: -2 },
      duration: 0.55,
    },
  ],
  caption:
    'Right-side example: #2 delivers after the wide combination; #7 can also be the final server. Mirror with #3 and #11 on the left.',
  legend: [
    { markClass: 'pass', label: 'Pass' },
    { markClass: 'run', label: 'Player run' },
    { markClass: 'cross', label: 'Cross or cutback' },
  ],
}

const OUT_OF_POSSESSION_SCENARIO: FullbackSkillScenarioData = {
  players: [
    {
      id: 'goalkeeper',
      label: '1',
      role: 'Goalkeeper',
      start: { x: 50, y: 82 },
      tone: 'keeper',
    },
    {
      id: 'six',
      label: '6',
      role: 'Channel 3 protection',
      start: { x: 50, y: 65 },
    },
    {
      id: 'four',
      label: '4',
      role: 'Compact back line',
      start: { x: 38, y: 78 },
    },
    {
      id: 'five',
      label: '5',
      role: 'Shifts across',
      start: { x: 60, y: 75 },
    },
    {
      id: 'winger',
      label: '7',
      role: 'Recovers wide',
      start: { x: 88, y: 35 },
    },
    {
      id: 'fullback',
      label: '2',
      role: 'Defends wide',
      start: { x: 78, y: 58 },
    },
    {
      id: 'opponent-receiver',
      label: 'OPP',
      role: 'Wide receiver',
      start: { x: 85, y: 40 },
      tone: 'opponent',
    },
  ],
  ballStart: { x: 90, y: 48 },
  steps: [
    {
      id: 'threat-advances',
      cue: 'Threat in Channel 1',
      kind: 'run',
      ballTo: { x: 83, y: 41 },
      duration: 0.6,
    },
    {
      id: 'fullback-steps-out',
      cue: 'Fullback steps out',
      kind: 'run',
      playerId: 'fullback',
      playerTo: { x: 81, y: 45 },
      duration: 0.6,
      emphasizePlayerId: 'fullback',
      emphasisCue: 'Close down receiver',
    },
    {
      id: 'winger-recovers',
      cue: 'Winger recovers',
      kind: 'run',
      playerId: 'winger',
      playerTo: { x: 77, y: 53 },
      duration: 0.7,
    },
    {
      id: 'six-protects',
      cue: 'Protect Channel 3',
      kind: 'run',
      playerId: 'six',
      playerTo: { x: 46, y: 58 },
      duration: 0.5,
    },
    {
      id: 'back-line-shifts',
      cue: 'Delay forward progress',
      kind: 'run',
      playerId: 'five',
      playerTo: { x: 69, y: 70 },
      ballTo: { x: 83, y: 43 },
      duration: 0.55,
    },
  ],
  caption:
    'Right-side example: #2 presses the receiver while the back line shifts to protect Channel 1. Mirror with #3 and #11 on the left.',
  legend: [
    { markClass: 'run', label: 'Pressure' },
    { markClass: 'pass', label: 'Recovery' },
  ],
}

const TRANSITION_SCENARIO: FullbackSkillScenarioData = {
  players: [
    {
      id: 'goalkeeper',
      label: '1',
      role: 'Goalkeeper',
      start: { x: 50, y: 82 },
      tone: 'keeper',
    },
    {
      id: 'six',
      label: '6',
      role: 'Protects inside lane',
      start: { x: 48, y: 55 },
    },
    {
      id: 'four',
      label: '4',
      role: 'Recovers compact',
      start: { x: 38, y: 75 },
    },
    {
      id: 'five',
      label: '5',
      role: 'Recovers compact',
      start: { x: 62, y: 75 },
    },
    {
      id: 'winger',
      label: '7',
      role: 'Nearest player delays',
      start: { x: 90, y: 36 },
    },
    {
      id: 'fullback',
      label: '2',
      role: 'Recovers wide',
      start: { x: 76, y: 44 },
    },
    {
      id: 'opponent-carrier',
      label: 'OPP',
      role: 'Counter-attacking carrier',
      start: { x: 88, y: 56 },
      tone: 'opponent',
    },
  ],
  ballStart: { x: 84, y: 40 },
  steps: [
    {
      id: 'ball-lost',
      cue: 'Ball lost',
      kind: 'run',
      ballTo: { x: 84, y: 40 },
      duration: 0.4,
      emphasizePlayerId: 'winger',
      emphasisCue: 'React immediately',
    },
    {
      id: 'nearest-delays',
      cue: 'Nearest player delays',
      kind: 'run',
      playerId: 'winger',
      playerTo: { x: 88, y: 47 },
      duration: 0.5,
    },
    {
      id: 'fullback-recovers',
      cue: 'Fullback recovers',
      kind: 'run',
      playerId: 'fullback',
      playerTo: { x: 76, y: 58 },
      duration: 0.6,
    },
    {
      id: 'six-protects-inside',
      cue: 'Protect inside lane',
      kind: 'run',
      playerId: 'six',
      playerTo: { x: 47, y: 59 },
      duration: 0.45,
    },
    {
      id: 'back-line-compact',
      cue: 'Recover compact',
      kind: 'run',
      playerId: 'four',
      playerTo: { x: 42, y: 78 },
      ballTo: { x: 80, y: 50 },
      duration: 0.5,
    },
    {
      id: 'protect-inside-lane',
      cue: 'Protect inside lane',
      kind: 'run',
      playerId: 'five',
      playerTo: { x: 61, y: 77 },
      duration: 0.4,
    },
  ],
  caption:
    'Right-side example: #7 delays while #2 recovers and the back line resets compact. Mirror with #3 and #11 on the left.',
  legend: [
    { markClass: 'run', label: 'Pressure' },
    { markClass: 'pass', label: 'Recovery' },
  ],
}

export const FULLBACK_SKILL_SCENARIOS: Record<FullbackSkillVariant, FullbackSkillScenarioData> = {
  'in-possession': IN_POSSESSION_SCENARIO,
  'out-of-possession': OUT_OF_POSSESSION_SCENARIO,
  transition: TRANSITION_SCENARIO,
}
