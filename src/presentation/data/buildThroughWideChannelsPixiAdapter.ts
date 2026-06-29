import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  BUILD_THROUGH_WIDE_CHANNELS_BALL_START,
  BUILD_THROUGH_WIDE_CHANNELS_CAPTION,
  BUILD_THROUGH_WIDE_CHANNELS_MOVEMENTS,
  BUILD_THROUGH_WIDE_CHANNELS_PLAYERS,
  type BuildThroughWideChannelsMovement,
} from './buildThroughWideChannelsScenario'

type BuildThroughWideChannelsPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

function getMovement(id: string): BuildThroughWideChannelsMovement {
  const movement = BUILD_THROUGH_WIDE_CHANNELS_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing build-through-wide-channels movement: ${id}`)
  }

  return movement
}

const playWide = getMovement('play-wide')
const rightBackOverlap = getMovement('right-back-overlap')
const cutInside = getMovement('cut-inside')
const fourStepIn = getMovement('four-step-in')
const fourToTen = getMovement('four-to-ten')
const nineNearPost = getMovement('nine-near-post')
const tenFindsNine = getMovement('ten-finds-nine')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'secure-build',
    cue: 'Secure build-up',
    emphasizePlayerId: 'left-back',
    duration: 0.22,
  },
  {
    id: 'release-wide',
    cue: 'Play wide',
    ballFrom: playWide.from,
    ballTo: playWide.to,
    playerId: rightBackOverlap.playerId,
    playerTo: rightBackOverlap.to,
    duration: 0.72,
  },
  {
    id: 'arrive-underneath',
    cue: '#4 arrives underneath',
    ballFrom: cutInside.from,
    ballTo: cutInside.to,
    playerId: fourStepIn.playerId,
    playerTo: fourStepIn.to,
    duration: 0.62,
  },
  {
    id: 'find-ten',
    cue: 'Find #10 between lines',
    ballFrom: fourToTen.from,
    ballTo: fourToTen.to,
    duration: 0.58,
  },
  {
    id: 'finish-run',
    cue: '#9 attacks near post',
    ballFrom: tenFindsNine.from,
    ballTo: tenFindsNine.to,
    playerId: nineNearPost.playerId,
    playerTo: nineNearPost.to,
    duration: 0.5,
  },
  {
    id: 'finish',
    cue: 'Finish',
    emphasizePlayerId: 'nine',
    duration: 0.32,
  },
]

const routes: PixiPitchPreviewRoute[] = BUILD_THROUGH_WIDE_CHANNELS_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind === 'support' ? 'recovery' : movement.kind,
  revealOnStepId:
    movement.id === 'play-wide' || movement.id === 'right-back-overlap'
      ? 'release-wide'
      : movement.id === 'cut-inside' || movement.id === 'four-step-in'
        ? 'arrive-underneath'
        : movement.id === 'four-to-ten'
          ? 'find-ten'
          : 'finish-run',
}))

export const BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO: BuildThroughWideChannelsPixiScenario = {
  players: BUILD_THROUGH_WIDE_CHANNELS_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' ? 'opponent' : 'primary',
  })),
  ballPosition: BUILD_THROUGH_WIDE_CHANNELS_BALL_START,
  steps,
  routes,
  caption: BUILD_THROUGH_WIDE_CHANNELS_CAPTION,
}
