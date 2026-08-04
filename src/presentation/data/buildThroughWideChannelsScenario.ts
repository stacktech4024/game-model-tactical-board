export type BuildThroughWideChannelsPoint = {
  x: number
  y: number
}

export type BuildThroughWideChannelsPlayer = {
  id: string
  label: string
  role: string
  start: BuildThroughWideChannelsPoint
  tone?: 'primary' | 'support' | 'opponent' | 'keeper'
}

export type BuildThroughWideChannelsMovement = {
  id: string
  playerId?: string
  from: BuildThroughWideChannelsPoint
  to: BuildThroughWideChannelsPoint
  kind: 'pass' | 'run' | 'support'
}

export const BUILD_THROUGH_WIDE_CHANNELS_PLAYERS: BuildThroughWideChannelsPlayer[] = [
  { id: 'left-back', label: '3', role: 'Build-up release', start: { x: 16, y: 73 } },
  { id: 'six', label: '6', role: 'Underneath support', start: { x: 32, y: 62 }, tone: 'support' },
  { id: 'left-wing', label: '11', role: 'Wide-channel receiver', start: { x: 18, y: 42 } },
  { id: 'right-back', label: '2', role: 'Far-side overlap', start: { x: 78, y: 70 }, tone: 'support' },
  { id: 'centre-back', label: '4', role: 'Central release point', start: { x: 38, y: 74 } },
  { id: 'ten', label: '10', role: 'Final pass option', start: { x: 42, y: 24 } },
  { id: 'nine', label: '9', role: 'Near-post finisher', start: { x: 58, y: 20 } },
  { id: 'opponent-nine', label: '9', role: 'First pressing forward', start: { x: 27, y: 67 }, tone: 'opponent' },
  { id: 'opponent-eight', label: '8', role: 'Central midfield screen', start: { x: 38, y: 54 }, tone: 'opponent' },
  { id: 'opponent-three', label: '3', role: 'Wide-channel defender', start: { x: 20, y: 37 }, tone: 'opponent' },
  { id: 'opponent-five', label: '5', role: 'Tracking centre-back', start: { x: 60, y: 20 }, tone: 'opponent' },
  { id: 'opponent-two', label: '2', role: 'Weak-side fullback', start: { x: 84, y: 22 }, tone: 'opponent' },
  { id: 'keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 93 }, tone: 'keeper' },
  { id: 'right-centre-back', label: '5', role: 'Holds position', start: { x: 62, y: 76 } },
  { id: 'right-wing', label: '7', role: 'Holds position', start: { x: 85, y: 41 } },
  { id: 'eight', label: '8', role: 'Holds position', start: { x: 62, y: 50 } },
  { id: 'opponent-keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 6 }, tone: 'keeper' },
  { id: 'opponent-four', label: '4', role: 'Holds position', start: { x: 40, y: 17 }, tone: 'opponent' },
  { id: 'opponent-six', label: '6', role: 'Holds position', start: { x: 50, y: 12 }, tone: 'opponent' },
  { id: 'opponent-seven', label: '7', role: 'Holds position', start: { x: 74, y: 24 }, tone: 'opponent' },
  { id: 'opponent-ten', label: '10', role: 'Holds position', start: { x: 50, y: 24 }, tone: 'opponent' },
  { id: 'opponent-eleven', label: '11', role: 'Holds position', start: { x: 26, y: 20 }, tone: 'opponent' },
]

export const BUILD_THROUGH_WIDE_CHANNELS_BALL_START: BuildThroughWideChannelsPoint = { x: 16, y: 73 }

export const BUILD_THROUGH_WIDE_CHANNELS_MOVEMENTS: BuildThroughWideChannelsMovement[] = [
  {
    id: 'play-wide',
    from: { x: 16, y: 73 },
    to: { x: 18, y: 42 },
    kind: 'pass',
  },
  {
    id: 'right-back-overlap',
    playerId: 'right-back',
    from: { x: 78, y: 70 },
    to: { x: 84, y: 36 },
    kind: 'run',
  },
  {
    id: 'cut-inside',
    from: { x: 18, y: 42 },
    to: { x: 38, y: 48 },
    kind: 'pass',
  },
  {
    id: 'four-step-in',
    playerId: 'centre-back',
    from: { x: 38, y: 74 },
    to: { x: 38, y: 48 },
    kind: 'support',
  },
  {
    id: 'four-to-ten',
    from: { x: 38, y: 48 },
    to: { x: 42, y: 24 },
    kind: 'pass',
  },
  {
    id: 'nine-near-post',
    playerId: 'nine',
    from: { x: 58, y: 20 },
    to: { x: 54, y: 13 },
    kind: 'run',
  },
  {
    id: 'ten-finds-nine',
    from: { x: 42, y: 24 },
    to: { x: 54, y: 13 },
    kind: 'pass',
  },
]

export const BUILD_THROUGH_WIDE_CHANNELS_CAPTION =
  'Build through width, arrive underneath, then find #10 and #9 for the central finish.'
