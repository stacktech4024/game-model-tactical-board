import type { ScenarioArrowType, ScenarioMoment } from '../../domain/scenarios/scenarioTypes'

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
  side?: 'home' | 'away'
  facingAngle: number
}

export type FullbackScenarioStep = {
  id: string
  cue: string
  kind: 'pass' | 'run' | 'cross'
  ballFrom?: FullbackScenarioPoint
  ballTo?: FullbackScenarioPoint
  playerId?: string
  playerTo?: FullbackScenarioPoint
  facingAngle?: number
  playerMoves?: {
    playerId: string
    to: FullbackScenarioPoint
    startDelay?: number
    facingAngle: number
  }[]
  playerFacings?: { playerId: string; facingAngle: number }[]
  duration: number
  emphasizePlayerId?: string
  emphasisCue?: string
}

export type FullbackScenarioRoute = {
  id: string
  from: FullbackScenarioPoint
  to: FullbackScenarioPoint
  type: ScenarioArrowType
  revealOnStepId?: string
}

export type FullbackCoachingDetail = {
  who: string
  what: string
  when: string
  where: string
  why: string
  how: string
}

export type FullbackSkillVariant =
  | 'wide-release-overlap'
  | 'defend-wide-1v1'
  | 'recover-inside-after-loss'

export type FullbackSkillScenarioData = {
  id: FullbackSkillVariant
  tabLabel: string
  title: string
  moment: ScenarioMoment
  system: string
  geography: string
  gameModelReason: string
  coachingDetail: FullbackCoachingDetail
  observableSuccess: string[]
  matchTransfer: string[]
  transferStatement: string
  relatedTraining: {
    label: string
    href: string
    note: string
  }
  animationDescription: string
  players: FullbackScenarioPlayer[]
  ballStart: FullbackScenarioPoint
  steps: FullbackScenarioStep[]
  routes: FullbackScenarioRoute[]
  caption: string
}

export const FULLBACK_DEFAULT_SKILL_ID: FullbackSkillVariant = 'wide-release-overlap'

export const FULLBACK_SKILL_ORDER: FullbackSkillVariant[] = [
  'wide-release-overlap',
  'defend-wide-1v1',
  'recover-inside-after-loss',
]

const WIDE_RELEASE_OVERLAP: FullbackSkillScenarioData = {
  id: 'wide-release-overlap',
  tabLabel: 'Wide Release & Overlap',
  title: 'Recognize when to support — and when to go',
  moment: 'Attacking Organization',
  system: '1-4-4-2',
  geography: 'Zones 2–3 → Zone 4 · Channels 1–2',
  gameModelReason:
    'In my Game Model, the Fullback supports underneath until the wide player fixes the defender, then overlaps to create the free player into Zone 4.',
  coachingDetail: {
    who: '#2 Aaron / #3 Christian',
    what: 'Support wide progression and overlap when the picture allows.',
    when: 'The wide player receives and fixes the defender, with cover behind established.',
    where: 'Zones 2–3 progressing into Zone 4, Channels 1–2.',
    why: 'Create an overload and progress into a better crossing or finishing position.',
    how: 'Scan early, receive open, support underneath, accelerate beyond at the right moment, then select the final action.',
  },
  observableSuccess: [
    'Scans upfield and inside before receiving.',
    'First touch preserves the forward option.',
    'Stays underneath until the wide player fixes the defender.',
    'The overlap frees the Fullback or moves a defender.',
    'Cross, cutback, combination or reset matches the Zone 4 picture.',
  ],
  matchTransfer: [
    'CIRCULATE',
    'RELEASE WIDE',
    'FIX DEFENDER',
    'FULLBACK OVERLAPS',
    'ENTER ZONE 4',
    'CROSS / CUTBACK / RESET',
  ],
  transferStatement:
    'This is the Fullback action required to execute our Attacking Organization tactic shown in Game Analysis.',
  relatedTraining: {
    label: 'Central → Wide',
    href: '/presentation/how-we-train-session?example=central-wide',
    note: 'This is worked on in my Central → Wide session, where the players recognize when the middle is closed and release into the wide channel.',
  },
  animationDescription:
    'Fullback #2 scans and receives open, supports underneath while #7 fixes the wide defender, then overlaps into Zone 4 and serves #9 as the covering defender reacts.',
  players: [
    { id: 'fb-6', label: '6', role: 'Central circulation', start: { x: 48, y: 70 }, side: 'home', facingAngle: 55 },
    { id: 'fb-10', label: '10', role: 'Inside connection', start: { x: 61, y: 55 }, side: 'home', facingAngle: 104 },
    { id: 'fb-7', label: '7', role: 'Holds width and fixes', start: { x: 88, y: 42 }, side: 'home', facingAngle: 165 },
    { id: 'fb-2', label: '2', role: 'Selected Fullback', start: { x: 84, y: 65 }, side: 'home', tone: 'primary', facingAngle: -105 },
    { id: 'fb-9', label: '9', role: 'Central finishing reference', start: { x: 52, y: 19 }, side: 'home', facingAngle: 170 },
    { id: 'opp-11', label: '11', role: 'Closes central progression', start: { x: 58, y: 66 }, side: 'away', tone: 'opponent', facingAngle: 98 },
    { id: 'opp-3', label: '3', role: 'Wide defender', start: { x: 81, y: 37 }, side: 'away', tone: 'opponent', facingAngle: 160 },
    { id: 'opp-5', label: '5', role: 'Covering defender', start: { x: 62, y: 25 }, side: 'away', tone: 'opponent', facingAngle: 172 },
  ],
  ballStart: { x: 48, y: 70 },
  steps: [
    {
      id: 'fullback-scan',
      cue: 'SCAN — upfield, inside, wide player, defender.',
      kind: 'run',
      emphasizePlayerId: 'fb-2',
      emphasisCue: 'SCAN UPFIELD · SCAN INSIDE',
      playerFacings: [
        { playerId: 'fb-2', facingAngle: -24 },
        { playerId: 'fb-6', facingAngle: 55 },
        { playerId: 'fb-10', facingAngle: 104 },
        { playerId: 'fb-7', facingAngle: 165 },
        { playerId: 'fb-9', facingAngle: 170 },
        { playerId: 'opp-11', facingAngle: 98 },
        { playerId: 'opp-3', facingAngle: 160 },
        { playerId: 'opp-5', facingAngle: 172 },
      ],
      duration: 0.45,
    },
    {
      id: 'fullback-receive',
      cue: 'RECEIVE OPEN — first touch keeps the forward picture.',
      kind: 'pass',
      ballFrom: { x: 48, y: 70 },
      ballTo: { x: 82, y: 62 },
      playerId: 'fb-2',
      playerTo: { x: 82, y: 62 },
      facingAngle: -108,
      playerMoves: [
        { playerId: 'opp-11', to: { x: 63, y: 63 }, facingAngle: 102 },
        { playerId: 'opp-3', to: { x: 82, y: 39 }, startDelay: 0.08, facingAngle: 164 },
      ],
      playerFacings: [
        { playerId: 'fb-6', facingAngle: 72 },
        { playerId: 'fb-10', facingAngle: 112 },
        { playerId: 'fb-7', facingAngle: 168 },
        { playerId: 'fb-9', facingAngle: 166 },
        { playerId: 'opp-5', facingAngle: 170 },
      ],
      duration: 0.62,
    },
    {
      id: 'fullback-connect',
      cue: 'CONNECT — play inside and stay available underneath.',
      kind: 'pass',
      ballFrom: { x: 82, y: 62 },
      ballTo: { x: 61, y: 55 },
      playerId: 'fb-10',
      playerTo: { x: 61, y: 55 },
      facingAngle: 76,
      playerMoves: [
        { playerId: 'fb-2', to: { x: 85, y: 55 }, facingAngle: -118 },
        { playerId: 'opp-11', to: { x: 64, y: 58 }, startDelay: 0.06, facingAngle: 116 },
      ],
      playerFacings: [
        { playerId: 'fb-6', facingAngle: 62 },
        { playerId: 'fb-7', facingAngle: 171 },
        { playerId: 'fb-9', facingAngle: 166 },
        { playerId: 'opp-3', facingAngle: 163 },
        { playerId: 'opp-5', facingAngle: 168 },
      ],
      duration: 0.55,
    },
    {
      id: 'wide-player-fixes',
      cue: 'WAIT UNDERNEATH — #7 receives and fixes the defender.',
      kind: 'pass',
      ballFrom: { x: 61, y: 55 },
      ballTo: { x: 88, y: 42 },
      playerId: 'fb-7',
      playerTo: { x: 87, y: 41 },
      facingAngle: 168,
      playerMoves: [
        { playerId: 'opp-3', to: { x: 84, y: 39 }, facingAngle: 168 },
        { playerId: 'opp-11', to: { x: 67, y: 55 }, startDelay: 0.08, facingAngle: 123 },
      ],
      playerFacings: [
        { playerId: 'fb-2', facingAngle: -127 },
        { playerId: 'fb-6', facingAngle: 56 },
        { playerId: 'fb-10', facingAngle: 82 },
        { playerId: 'fb-9', facingAngle: 164 },
        { playerId: 'opp-5', facingAngle: 166 },
      ],
      duration: 0.62,
    },
    {
      id: 'overlap-trigger',
      cue: 'TRIGGER — defender fixed, cover behind, accelerate beyond.',
      kind: 'run',
      playerId: 'fb-2',
      playerTo: { x: 91, y: 24 },
      facingAngle: -16,
      emphasizePlayerId: 'fb-2',
      emphasisCue: 'RECOGNIZE · THEN GO',
      playerMoves: [
        { playerId: 'opp-3', to: { x: 82, y: 35 }, facingAngle: 176 },
        { playerId: 'opp-5', to: { x: 70, y: 23 }, startDelay: 0.1, facingAngle: 122 },
        { playerId: 'fb-10', to: { x: 63, y: 39 }, startDelay: 0.08, facingAngle: 42 },
        { playerId: 'fb-6', to: { x: 51, y: 57 }, startDelay: 0.12, facingAngle: 44 },
      ],
      playerFacings: [
        { playerId: 'fb-7', facingAngle: 170 },
        { playerId: 'fb-9', facingAngle: 160 },
        { playerId: 'opp-11', facingAngle: 126 },
      ],
      duration: 0.78,
    },
    {
      id: 'zone-four-receive',
      cue: 'ZONE 4 — receive in stride with head and eyes up.',
      kind: 'pass',
      ballFrom: { x: 87, y: 41 },
      ballTo: { x: 91, y: 21 },
      playerId: 'fb-2',
      playerTo: { x: 91, y: 21 },
      facingAngle: -28,
      playerMoves: [
        { playerId: 'fb-9', to: { x: 52, y: 14 }, facingAngle: 170 },
        { playerId: 'opp-5', to: { x: 67, y: 18 }, startDelay: 0.08, facingAngle: 118 },
        { playerId: 'opp-3', to: { x: 79, y: 27 }, startDelay: 0.12, facingAngle: 145 },
      ],
      playerFacings: [
        { playerId: 'fb-7', facingAngle: -18 },
        { playerId: 'fb-10', facingAngle: 36 },
        { playerId: 'fb-6', facingAngle: 32 },
        { playerId: 'opp-11', facingAngle: 115 },
      ],
      duration: 0.58,
    },
    {
      id: 'zone-four-decision',
      cue: 'HEAD UP — cross shown; cut back or reset if the picture changes.',
      kind: 'cross',
      ballFrom: { x: 91, y: 21 },
      ballTo: { x: 52, y: 13 },
      emphasizePlayerId: 'fb-2',
      emphasisCue: 'READ #9 · #10 · WIDE RUNNER',
      playerMoves: [
        { playerId: 'fb-9', to: { x: 52, y: 12 }, facingAngle: -92 },
        { playerId: 'opp-5', to: { x: 59, y: 15 }, startDelay: 0.08, facingAngle: -105 },
        { playerId: 'fb-7', to: { x: 74, y: 19 }, startDelay: 0.1, facingAngle: -70 },
      ],
      playerFacings: [
        { playerId: 'fb-2', facingAngle: -92 },
        { playerId: 'fb-10', facingAngle: 20 },
        { playerId: 'fb-6', facingAngle: 26 },
        { playerId: 'opp-3', facingAngle: -120 },
        { playerId: 'opp-11', facingAngle: 102 },
      ],
      duration: 0.82,
    },
  ],
  routes: [
    { id: 'fb-release-pass', from: { x: 48, y: 70 }, to: { x: 82, y: 62 }, type: 'pass', revealOnStepId: 'fullback-receive' },
    { id: 'fb-underneath-run', from: { x: 84, y: 65 }, to: { x: 85, y: 55 }, type: 'run', revealOnStepId: 'fullback-connect' },
    { id: 'fb-wide-pass', from: { x: 61, y: 55 }, to: { x: 88, y: 42 }, type: 'pass', revealOnStepId: 'wide-player-fixes' },
    { id: 'fb-overlap-run', from: { x: 85, y: 55 }, to: { x: 91, y: 21 }, type: 'run', revealOnStepId: 'overlap-trigger' },
    { id: 'fb-overlap-release', from: { x: 87, y: 41 }, to: { x: 91, y: 21 }, type: 'pass', revealOnStepId: 'zone-four-receive' },
    { id: 'fb-zone-four-service', from: { x: 91, y: 21 }, to: { x: 52, y: 13 }, type: 'cross', revealOnStepId: 'zone-four-decision' },
  ],
  caption: 'Right-side #2 example. The same recognition applies to #3 Christian with #11 on the left.',
}

const DEFEND_WIDE_ONE_V_ONE: FullbackSkillScenarioData = {
  id: 'defend-wide-1v1',
  tabLabel: 'Defend Wide 1v1',
  title: 'Protect inside, control the duel',
  moment: 'Defensive Organization',
  system: '1-4-2-3-1',
  geography: 'Channel 1 · deny Channels 2–3',
  gameModelReason:
    'What I want the Fullback to recognize is when to support the first pressure, protect the inside lane and control the wide duel without diving in.',
  coachingDetail: {
    who: '#2 Aaron / #3 Christian',
    what: 'Protect inside and control the wide 1v1.',
    when: 'The opponent receives in Channel 1 and the wide player applies first pressure.',
    where: 'Channel 1, while denying access to Channels 2–3.',
    why: 'Keep central progression closed and make the next action predictable.',
    how: 'Arrive under control, stay half-turned, side shuffle and connect to cover.',
  },
  observableSuccess: [
    'Arrives with the inside route closed.',
    'Reduces speed before tackling distance.',
    'Stays side-on and can react forward or backward.',
    'Pressure and cover remain connected.',
  ],
  matchTransfer: ['PROTECT INSIDE', 'CONTROL APPROACH', 'DIRECT WIDE', 'DELAY / REGAIN'],
  transferStatement: 'The Fullback helps turn wide pressure into a connected unit action.',
  relatedTraining: {
    label: 'Wide Pressure',
    href: '/presentation/how-we-train-session?example=wide-pressure',
    note: 'In Practice Session 8, the players work on the approach angle, body position, cover and forcing the opponent one way.',
  },
  animationDescription:
    'Fullback #2 stays half-turned behind #7, closes the inside route as the opponent receives wide, then delays the dribble while #6 and #5 provide cover.',
  players: [
    { id: 'duel-7', label: '7', role: 'First pressure', start: { x: 75, y: 47 }, side: 'home', facingAngle: 92 },
    { id: 'duel-2', label: '2', role: 'Selected Fullback', start: { x: 74, y: 58 }, side: 'home', tone: 'primary', facingAngle: 62 },
    { id: 'duel-6', label: '6', role: 'Inside cover', start: { x: 56, y: 58 }, side: 'home', facingAngle: 78 },
    { id: 'duel-5', label: '5', role: 'Depth cover', start: { x: 58, y: 72 }, side: 'home', facingAngle: 52 },
    { id: 'duel-a11', label: '11', role: 'Wide carrier', start: { x: 88, y: 48 }, side: 'away', tone: 'opponent', facingAngle: 180 },
    { id: 'duel-a8', label: '8', role: 'Inside support', start: { x: 68, y: 57 }, side: 'away', tone: 'opponent', facingAngle: 112 },
    { id: 'duel-a9', label: '9', role: 'Pins cover', start: { x: 50, y: 42 }, side: 'away', tone: 'opponent', facingAngle: 178 },
  ],
  ballStart: { x: 68, y: 57 },
  steps: [
    {
      id: 'duel-picture',
      cue: 'PICTURE — protect inside before the wide pass arrives.',
      kind: 'run',
      emphasizePlayerId: 'duel-2',
      playerFacings: [
        { playerId: 'duel-7', facingAngle: 92 },
        { playerId: 'duel-2', facingAngle: 62 },
        { playerId: 'duel-6', facingAngle: 78 },
        { playerId: 'duel-5', facingAngle: 52 },
        { playerId: 'duel-a11', facingAngle: 180 },
        { playerId: 'duel-a8', facingAngle: 112 },
        { playerId: 'duel-a9', facingAngle: 178 },
      ],
      duration: 0.42,
    },
    {
      id: 'duel-wide-receive',
      cue: 'WIDE TOUCH — #7 presses; #2 closes the next inside route.',
      kind: 'pass',
      ballFrom: { x: 68, y: 57 },
      ballTo: { x: 89, y: 50 },
      playerId: 'duel-a11',
      playerTo: { x: 89, y: 50 },
      facingAngle: 176,
      playerMoves: [
        { playerId: 'duel-7', to: { x: 84, y: 49 }, facingAngle: 91 },
        { playerId: 'duel-2', to: { x: 81, y: 57 }, startDelay: 0.06, facingAngle: 68 },
        { playerId: 'duel-6', to: { x: 62, y: 57 }, startDelay: 0.1, facingAngle: 82 },
      ],
      playerFacings: [
        { playerId: 'duel-5', facingAngle: 58 },
        { playerId: 'duel-a8', facingAngle: 118 },
        { playerId: 'duel-a9', facingAngle: 174 },
      ],
      duration: 0.58,
    },
    {
      id: 'duel-delay',
      cue: 'CONTROL — decelerate, stay side-on, delay the dribble.',
      kind: 'run',
      ballFrom: { x: 89, y: 50 },
      ballTo: { x: 94, y: 44 },
      playerId: 'duel-a11',
      playerTo: { x: 94, y: 44 },
      facingAngle: 174,
      playerMoves: [
        { playerId: 'duel-2', to: { x: 88, y: 51 }, facingAngle: 78 },
        { playerId: 'duel-7', to: { x: 89, y: 48 }, startDelay: 0.05, facingAngle: 140 },
        { playerId: 'duel-5', to: { x: 65, y: 68 }, startDelay: 0.1, facingAngle: 63 },
      ],
      playerFacings: [
        { playerId: 'duel-6', facingAngle: 88 },
        { playerId: 'duel-a8', facingAngle: 128 },
        { playerId: 'duel-a9', facingAngle: 166 },
      ],
      duration: 0.58,
    },
    {
      id: 'duel-forced-back',
      cue: 'CONNECTED — inside closed; the carrier resets under pressure.',
      kind: 'pass',
      ballFrom: { x: 94, y: 44 },
      ballTo: { x: 71, y: 61 },
      playerId: 'duel-a8',
      playerTo: { x: 71, y: 61 },
      facingAngle: -70,
      playerMoves: [
        { playerId: 'duel-2', to: { x: 85, y: 54 }, facingAngle: 72 },
        { playerId: 'duel-6', to: { x: 64, y: 59 }, startDelay: 0.08, facingAngle: 93 },
      ],
      playerFacings: [
        { playerId: 'duel-7', facingAngle: 132 },
        { playerId: 'duel-5', facingAngle: 65 },
        { playerId: 'duel-a11', facingAngle: -128 },
        { playerId: 'duel-a9', facingAngle: 168 },
      ],
      duration: 0.62,
    },
  ],
  routes: [
    { id: 'duel-wide-pass-route', from: { x: 68, y: 57 }, to: { x: 89, y: 50 }, type: 'pass', revealOnStepId: 'duel-wide-receive' },
    { id: 'duel-fullback-pressure', from: { x: 74, y: 58 }, to: { x: 88, y: 51 }, type: 'press', revealOnStepId: 'duel-delay' },
    { id: 'duel-reset-route', from: { x: 94, y: 44 }, to: { x: 71, y: 61 }, type: 'pass', revealOnStepId: 'duel-forced-back' },
  ],
  caption: 'Right-side #2 example. #7 applies first pressure while #2, #6 and #5 protect the inside and depth.',
}

const RECOVER_INSIDE_AFTER_LOSS: FullbackSkillScenarioData = {
  id: 'recover-inside-after-loss',
  tabLabel: 'Recover Inside',
  title: 'React, recover inside, reconnect',
  moment: 'Defensive Transition',
  system: 'Transition back toward the defensive unit',
  geography: 'From Zone 4 toward Zones 3–2 · inside Channel 1',
  gameModelReason:
    'When possession is lost high, the nearest player delays and the Fullback recovers inside first so the opponent cannot counter through the central lane.',
  coachingDetail: {
    who: '#2 Aaron / #3 Christian',
    what: 'Recover inside and reconnect with the covering unit.',
    when: 'The attack loses possession and the Fullback cannot counter-press immediately.',
    where: 'From Zone 4 toward Zones 3–2, recovering inside Channel 1.',
    why: 'Protect central depth before restoring wide protection.',
    how: 'Recognize the loss, open the body to ball and runners, sprint inside, then adjust with the unit.',
  },
  observableSuccess: [
    'Reacts immediately to the loss.',
    'Recovers inside before chasing the touchline.',
    'Sees the ball and central runner while moving.',
    'Reconnects with the centre-back and pivot.',
  ],
  matchTransfer: ['LOSS', 'NEAREST DELAYS', 'RECOVER INSIDE', 'RECONNECT', 'RESTORE WIDTH'],
  transferStatement: 'The recovery protects the centre first, then restores the Fullback’s wide role.',
  relatedTraining: {
    label: 'Line Break + React',
    href: '/presentation/how-we-train-session?example=line-break-react',
    note: 'The reason we train the reaction is so the nearest pressure and covering runs happen together when the ball turns over.',
  },
  animationDescription:
    'After a loss in Zone 4, #7 delays the opponent while Fullback #2 recovers diagonally inside, stays oriented to ball and runner, and reconnects with #6 and #5.',
  players: [
    { id: 'recover-7', label: '7', role: 'Nearest player delays', start: { x: 89, y: 31 }, side: 'home', facingAngle: 142 },
    { id: 'recover-2', label: '2', role: 'Selected Fullback', start: { x: 84, y: 39 }, side: 'home', tone: 'primary', facingAngle: 128 },
    { id: 'recover-6', label: '6', role: 'Protects inside lane', start: { x: 54, y: 57 }, side: 'home', facingAngle: 72 },
    { id: 'recover-5', label: '5', role: 'Centre-back cover', start: { x: 59, y: 73 }, side: 'home', facingAngle: 44 },
    { id: 'recover-a2', label: '2', role: 'Counter carrier', start: { x: 86, y: 35 }, side: 'away', tone: 'opponent', facingAngle: 180 },
    { id: 'recover-a8', label: '8', role: 'Inside runner', start: { x: 66, y: 48 }, side: 'away', tone: 'opponent', facingAngle: 178 },
    { id: 'recover-a9', label: '9', role: 'Central depth runner', start: { x: 52, y: 43 }, side: 'away', tone: 'opponent', facingAngle: 180 },
  ],
  ballStart: { x: 88, y: 30 },
  steps: [
    {
      id: 'recover-loss',
      cue: 'LOSS — recognize the new picture immediately.',
      kind: 'run',
      ballFrom: { x: 88, y: 30 },
      ballTo: { x: 86, y: 35 },
      emphasizePlayerId: 'recover-2',
      emphasisCue: 'LOSS · OPEN TO BALL AND RUNNERS',
      playerMoves: [
        { playerId: 'recover-a2', to: { x: 86, y: 37 }, facingAngle: 178 },
        { playerId: 'recover-a8', to: { x: 64, y: 51 }, startDelay: 0.06, facingAngle: 176 },
      ],
      playerFacings: [
        { playerId: 'recover-7', facingAngle: 142 },
        { playerId: 'recover-2', facingAngle: 128 },
        { playerId: 'recover-6', facingAngle: 72 },
        { playerId: 'recover-5', facingAngle: 44 },
        { playerId: 'recover-a9', facingAngle: 180 },
      ],
      duration: 0.42,
    },
    {
      id: 'recover-delay',
      cue: 'DELAY — #7 slows the first counter action.',
      kind: 'run',
      ballFrom: { x: 86, y: 37 },
      ballTo: { x: 82, y: 44 },
      playerId: 'recover-a2',
      playerTo: { x: 82, y: 44 },
      facingAngle: 176,
      playerMoves: [
        { playerId: 'recover-7', to: { x: 84, y: 40 }, facingAngle: 138 },
        { playerId: 'recover-a9', to: { x: 53, y: 50 }, startDelay: 0.08, facingAngle: 178 },
      ],
      playerFacings: [
        { playerId: 'recover-2', facingAngle: 132 },
        { playerId: 'recover-6', facingAngle: 78 },
        { playerId: 'recover-5', facingAngle: 48 },
        { playerId: 'recover-a8', facingAngle: 174 },
      ],
      duration: 0.52,
    },
    {
      id: 'recover-fullback-inside',
      cue: 'RECOVER INSIDE — see the ball and central runner while moving.',
      kind: 'run',
      playerId: 'recover-2',
      playerTo: { x: 73, y: 58 },
      facingAngle: 128,
      playerMoves: [
        { playerId: 'recover-6', to: { x: 58, y: 60 }, facingAngle: 82 },
        { playerId: 'recover-5', to: { x: 62, y: 69 }, startDelay: 0.08, facingAngle: 54 },
        { playerId: 'recover-a8', to: { x: 63, y: 57 }, startDelay: 0.06, facingAngle: 170 },
      ],
      playerFacings: [
        { playerId: 'recover-7', facingAngle: 142 },
        { playerId: 'recover-a2', facingAngle: 168 },
        { playerId: 'recover-a9', facingAngle: 174 },
      ],
      duration: 0.68,
    },
    {
      id: 'recover-reconnect',
      cue: 'RECONNECT — central depth protected; restore wide protection next.',
      kind: 'run',
      ballFrom: { x: 82, y: 44 },
      ballTo: { x: 70, y: 55 },
      playerId: 'recover-a8',
      playerTo: { x: 65, y: 58 },
      facingAngle: 168,
      playerMoves: [
        { playerId: 'recover-2', to: { x: 72, y: 62 }, facingAngle: 118 },
        { playerId: 'recover-5', to: { x: 63, y: 70 }, startDelay: 0.08, facingAngle: 58 },
      ],
      playerFacings: [
        { playerId: 'recover-7', facingAngle: 136 },
        { playerId: 'recover-6', facingAngle: 88 },
        { playerId: 'recover-a2', facingAngle: 164 },
        { playerId: 'recover-a9', facingAngle: 172 },
      ],
      duration: 0.58,
    },
  ],
  routes: [
    { id: 'recover-delay-route', from: { x: 89, y: 31 }, to: { x: 84, y: 40 }, type: 'press', revealOnStepId: 'recover-delay' },
    { id: 'recover-inside-route', from: { x: 84, y: 39 }, to: { x: 73, y: 58 }, type: 'recovery', revealOnStepId: 'recover-fullback-inside' },
    { id: 'recover-counter-route', from: { x: 86, y: 37 }, to: { x: 70, y: 55 }, type: 'pass', revealOnStepId: 'recover-reconnect' },
  ],
  caption: 'Right-side #2 example. #7 delays while #2 recovers inside and reconnects with #6 and #5.',
}

export const FULLBACK_SKILL_SCENARIOS: Record<FullbackSkillVariant, FullbackSkillScenarioData> = {
  'wide-release-overlap': WIDE_RELEASE_OVERLAP,
  'defend-wide-1v1': DEFEND_WIDE_ONE_V_ONE,
  'recover-inside-after-loss': RECOVER_INSIDE_AFTER_LOSS,
}

export function getFullbackSkillScenario(id: FullbackSkillVariant): FullbackSkillScenarioData {
  return FULLBACK_SKILL_SCENARIOS[id]
}
