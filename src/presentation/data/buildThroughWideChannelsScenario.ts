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
  side?: 'home' | 'away'
}

export type BuildThroughWideChannelsMovement = {
  id: string
  playerId?: string
  from: BuildThroughWideChannelsPoint
  to: BuildThroughWideChannelsPoint
  kind: 'pass' | 'run' | 'support' | 'press' | 'recovery'
}

export const BUILD_THROUGH_WIDE_CHANNELS_PLAYERS: BuildThroughWideChannelsPlayer[] = [
  { id: 'home-1', label: '1', role: 'Goalkeeper', start: { x: 50, y: 93 }, tone: 'keeper' },
  { id: 'home-2', label: '2', role: 'Far-side switch option', start: { x: 78, y: 54 } },
  { id: 'home-3', label: '3', role: 'Ball-side fullback release', start: { x: 16, y: 73 } },
  { id: 'home-4', label: '4', role: 'Support behind Channel 2', start: { x: 40, y: 76 } },
  { id: 'home-5', label: '5', role: 'Rest-defence cover', start: { x: 60, y: 76 } },
  { id: 'home-6', label: '6', role: 'Channel 2 support', start: { x: 34, y: 56 }, tone: 'support' },
  { id: 'home-7', label: '7', role: 'Far-side width', start: { x: 82, y: 42 } },
  { id: 'home-8', label: '8', role: 'Central balance', start: { x: 58, y: 58 } },
  { id: 'home-9', label: '9', role: 'Central Zone 4 finish', start: { x: 52, y: 28 } },
  { id: 'home-10', label: '10', role: 'Channel 3 link', start: { x: 46, y: 32 } },
  { id: 'home-11', label: '11', role: 'Channel 1 width', start: { x: 18, y: 42 } },
  { id: 'away-1', label: '1', role: 'Goalkeeper organizes the box', start: { x: 50, y: 7 }, tone: 'keeper', side: 'away' },
  { id: 'away-2', label: '2', role: 'Far-side tuck', start: { x: 78, y: 24 }, tone: 'opponent' },
  { id: 'away-3', label: '3', role: 'Ball-side wide pressure', start: { x: 22, y: 32 }, tone: 'opponent' },
  { id: 'away-4', label: '4', role: 'Central cover on #10', start: { x: 42, y: 25 }, tone: 'opponent' },
  { id: 'away-5', label: '5', role: 'Tracks #9', start: { x: 58, y: 25 }, tone: 'opponent' },
  { id: 'away-6', label: '6', role: 'Channel 2/3 screen', start: { x: 38, y: 42 }, tone: 'opponent' },
  { id: 'away-7', label: '7', role: 'Wide recovery', start: { x: 80, y: 44 }, tone: 'opponent' },
  { id: 'away-8', label: '8', role: 'Central balance', start: { x: 54, y: 43 }, tone: 'opponent' },
  { id: 'away-9', label: '9', role: 'Counter outlet', start: { x: 50, y: 65 }, tone: 'opponent' },
  { id: 'away-10', label: '10', role: 'Central screen', start: { x: 50, y: 36 }, tone: 'opponent' },
  { id: 'away-11', label: '11', role: 'Weak-side recovery', start: { x: 20, y: 45 }, tone: 'opponent' },
]

export const BUILD_THROUGH_WIDE_CHANNELS_BALL_START: BuildThroughWideChannelsPoint = { x: 16, y: 73 }

export const BUILD_THROUGH_WIDE_CHANNELS_MOVEMENTS: BuildThroughWideChannelsMovement[] = [
  {
    id: 'three-releases-eleven',
    from: { x: 16, y: 73 },
    to: { x: 18, y: 42 },
    kind: 'pass',
  },
  {
    id: 'three-supports-wide',
    playerId: 'home-3',
    from: { x: 16, y: 73 },
    to: { x: 14, y: 58 },
    kind: 'run',
  },
  {
    id: 'away-three-presses-wide',
    playerId: 'away-3',
    from: { x: 22, y: 32 },
    to: { x: 18, y: 38 },
    kind: 'press',
  },
  {
    id: 'away-six-screens-centre',
    playerId: 'away-6',
    from: { x: 38, y: 42 },
    to: { x: 40, y: 45 },
    kind: 'recovery',
  },
  {
    id: 'eleven-connects-six',
    from: { x: 18, y: 42 },
    to: { x: 34, y: 56 },
    kind: 'pass',
  },
  {
    id: 'four-supports-underneath',
    playerId: 'home-4',
    from: { x: 40, y: 76 },
    to: { x: 40, y: 62 },
    kind: 'support',
  },
  {
    id: 'six-finds-ten',
    from: { x: 34, y: 56 },
    to: { x: 46, y: 32 },
    kind: 'pass',
  },
  {
    id: 'away-four-covers-ten',
    playerId: 'away-4',
    from: { x: 42, y: 25 },
    to: { x: 44, y: 30 },
    kind: 'recovery',
  },
  {
    id: 'away-two-tucks',
    playerId: 'away-2',
    from: { x: 78, y: 24 },
    to: { x: 66, y: 23 },
    kind: 'recovery',
  },
  {
    id: 'ten-finds-nine',
    from: { x: 46, y: 32 },
    to: { x: 52, y: 20 },
    kind: 'pass',
  },
  {
    id: 'nine-finishes-zone-four',
    playerId: 'home-9',
    from: { x: 52, y: 28 },
    to: { x: 52, y: 20 },
    kind: 'run',
  },
  {
    id: 'away-five-tracks-nine',
    playerId: 'away-5',
    from: { x: 58, y: 25 },
    to: { x: 54, y: 21 },
    kind: 'recovery',
  },
  {
    id: 'away-keeper-sets',
    playerId: 'away-1',
    from: { x: 50, y: 7 },
    to: { x: 50, y: 10 },
    kind: 'recovery',
  },
]

function getMovement(id: string): BuildThroughWideChannelsMovement {
  const movement = BUILD_THROUGH_WIDE_CHANNELS_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing build-through-wide-channels movement: ${id}`)
  }

  return movement
}

const threeReleasesEleven = getMovement('three-releases-eleven')
const threeSupportsWide = getMovement('three-supports-wide')
const awayThreePressesWide = getMovement('away-three-presses-wide')
const awaySixScreensCentre = getMovement('away-six-screens-centre')
const elevenConnectsSix = getMovement('eleven-connects-six')
const fourSupportsUnderneath = getMovement('four-supports-underneath')
const sixFindsTen = getMovement('six-finds-ten')
const awayFourCoversTen = getMovement('away-four-covers-ten')
const awayTwoTucks = getMovement('away-two-tucks')
const tenFindsNine = getMovement('ten-finds-nine')
const nineFinishesZoneFour = getMovement('nine-finishes-zone-four')
const awayFiveTracksNine = getMovement('away-five-tracks-nine')
const awayKeeperSets = getMovement('away-keeper-sets')

export const BUILD_THROUGH_WIDE_CHANNELS_STEPS: PixiPitchPreviewStep[] = [
  { id: 'secure-build', cue: '#3 starts the Zone 2 build', emphasizePlayerId: 'home-3', duration: 0.25 },
  {
    id: 'release-channel-one',
    cue: '#3 releases #11 into Channel 1; the defender presses wide',
    ballFrom: threeReleasesEleven.from,
    ballTo: threeReleasesEleven.to,
    playerMoves: [
      { playerId: threeSupportsWide.playerId!, to: threeSupportsWide.to },
      { playerId: awayThreePressesWide.playerId!, to: awayThreePressesWide.to },
      { playerId: awaySixScreensCentre.playerId!, to: awaySixScreensCentre.to },
    ],
    duration: 0.64,
  },
  {
    id: 'connect-channel-two',
    cue: '#11 connects into #6 in Channel 2; #4 supports underneath',
    ballFrom: elevenConnectsSix.from,
    ballTo: elevenConnectsSix.to,
    playerId: fourSupportsUnderneath.playerId,
    playerTo: fourSupportsUnderneath.to,
    duration: 0.56,
  },
  {
    id: 'link-channel-three',
    cue: '#6 finds #10 in Channel 3; #2 and #7 hold the far-side switch',
    ballFrom: sixFindsTen.from,
    ballTo: sixFindsTen.to,
    playerMoves: [
      { playerId: awayFourCoversTen.playerId!, to: awayFourCoversTen.to },
      { playerId: awayTwoTucks.playerId!, to: awayTwoTucks.to },
    ],
    duration: 0.58,
  },
  {
    id: 'finish-zone-four',
    cue: '#10 finds #9 centrally for the Zone 4 finish',
    ballFrom: tenFindsNine.from,
    ballTo: tenFindsNine.to,
    playerMoves: [
      { playerId: nineFinishesZoneFour.playerId!, to: nineFinishesZoneFour.to },
      { playerId: awayFiveTracksNine.playerId!, to: awayFiveTracksNine.to },
      { playerId: awayKeeperSets.playerId!, to: awayKeeperSets.to },
    ],
    duration: 0.58,
  },
  { id: 'finish', cue: 'Channel 3 finish in Zone 4', emphasizePlayerId: 'home-9', duration: 0.3 },
]

const REVEAL_STEP_BY_MOVEMENT_ID: Record<string, string> = {
  'three-releases-eleven': 'release-channel-one',
  'three-supports-wide': 'release-channel-one',
  'away-three-presses-wide': 'release-channel-one',
  'away-six-screens-centre': 'release-channel-one',
  'eleven-connects-six': 'connect-channel-two',
  'four-supports-underneath': 'connect-channel-two',
  'six-finds-ten': 'link-channel-three',
  'away-four-covers-ten': 'link-channel-three',
  'away-two-tucks': 'link-channel-three',
  'ten-finds-nine': 'finish-zone-four',
  'nine-finishes-zone-four': 'finish-zone-four',
  'away-five-tracks-nine': 'finish-zone-four',
  'away-keeper-sets': 'finish-zone-four',
}

export const BUILD_THROUGH_WIDE_CHANNELS_ROUTES: PixiPitchPreviewRoute[] =
  BUILD_THROUGH_WIDE_CHANNELS_MOVEMENTS.map((movement) => ({
    id: movement.id,
    from: movement.from,
    to: movement.to,
    type: movement.kind === 'support' ? 'recovery' : movement.kind,
    revealOnStepId: REVEAL_STEP_BY_MOVEMENT_ID[movement.id],
  }))

export const BUILD_THROUGH_WIDE_CHANNELS_CAPTION =
  'Zone 2/3 build: #3 releases into Channel 1, #11 and #7 hold width, #6/#4 support underneath, then #10 finds #9 for the Channel 3 finish in Zone 4.'
import type { PixiPitchPreviewRoute, PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview'
