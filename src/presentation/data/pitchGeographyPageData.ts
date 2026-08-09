import { PITCH } from '../../domain/pitch/pitchConstants.ts'

export type PitchGeographyMode = 'zones' | 'channels' | 'both'

export const PITCH_GEOGRAPHY_DEFAULT_MODE: PitchGeographyMode = 'zones'

export const PITCH_GEOGRAPHY_MODES: { id: PitchGeographyMode; label: string }[] = [
  { id: 'zones', label: 'Zones' },
  { id: 'channels', label: 'Channels' },
  { id: 'both', label: 'Both' },
]

const ZONE_LANGUAGE = [
  { primary: 'Build Up', secondary: 'Protect Goal' },
  { primary: 'Unbalance', secondary: 'Security & Progression' },
  { primary: 'Supply', secondary: 'Creation' },
  { primary: 'Penetrate', secondary: 'Final Action' },
] as const

export const PITCH_GEOGRAPHY_ZONES = PITCH.ZONES.map((zone, index) => ({
  ...zone,
  ...ZONE_LANGUAGE[index],
}))

function getChannelDescription(channelId: string): 'Wide' | 'Half-space' | 'Central' {
  if (channelId.includes('half-space')) return 'Half-space'
  if (channelId.includes('central')) return 'Central'
  return 'Wide'
}

export const PITCH_GEOGRAPHY_CHANNELS = PITCH.CHANNELS.map((channel) => ({
  ...channel,
  channelNumber: Number(channel.label.match(/^CH(\d)/)?.[1] ?? 1),
  description: getChannelDescription(channel.id),
}))

export const PITCH_GEOGRAPHY_CALLOUTS = [
  {
    title: 'Attacking Organization',
    text: 'Progress through the zones, use Channel 1 width, Channel 2 support, and Channel 3 central penetration.',
  },
  {
    title: 'Defensive Organization',
    text: 'Protect Zones 1/2, deny Channel 3, and direct play toward Channel 1.',
  },
] as const
