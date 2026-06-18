export type PitchBand = {
  label: string
  startY: number
  endY: number
}

export type PitchChannel = {
  id: string
  side: 'left' | 'right'
  label: string
  startX: number
  endX: number
}

export const PITCH = {
  LENGTH: 105,
  WIDTH: 68,
  PENALTY_AREA_WIDTH: 40.32,
  PENALTY_AREA_DEPTH: 16.5,
  GOAL_AREA_WIDTH: 18.32,
  GOAL_AREA_DEPTH: 5.5,
  GOAL_WIDTH: 7.32,
  GOAL_DEPTH: 2.44,
  CENTRE_CIRCLE_RADIUS: 9.15,
  CORNER_ARC_RADIUS: 1.0,
  PENALTY_SPOT_DIST: 11.0,
  ZONES: [
    { label: 'Zone 1: Build Up', startY: 0, endY: 26.25 } satisfies PitchBand,
    {
      label: 'Zone 2: Unbalance',
      startY: 26.25,
      endY: 52.5,
    } satisfies PitchBand,
    { label: 'Zone 3: Supply', startY: 52.5, endY: 78.75 } satisfies PitchBand,
    {
      label: 'Zone 4: Penetrate',
      startY: 78.75,
      endY: 105,
    } satisfies PitchBand,
  ],
  CHANNELS: [
    {
      id: 'left-wide',
      side: 'left',
      label: 'CH1 Wide',
      startX: 0,
      endX: 11.33,
    } satisfies PitchChannel,
    {
      id: 'left-half-space',
      side: 'left',
      label: 'CH2 Half Space',
      startX: 11.33,
      endX: 22.66,
    } satisfies PitchChannel,
    {
      id: 'left-central',
      side: 'left',
      label: 'CH3 Central',
      startX: 22.66,
      endX: 34,
    } satisfies PitchChannel,
    {
      id: 'right-central',
      side: 'right',
      label: 'CH3 Central',
      startX: 34,
      endX: 45.33,
    } satisfies PitchChannel,
    {
      id: 'right-half-space',
      side: 'right',
      label: 'CH2 Half Space',
      startX: 45.33,
      endX: 56.66,
    } satisfies PitchChannel,
    {
      id: 'right-wide',
      side: 'right',
      label: 'CH1 Wide',
      startX: 56.66,
      endX: 68,
    } satisfies PitchChannel,
  ],
} as const
