import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PITCH } from '../../domain/pitch/pitchConstants.ts'
import { PRESENTATION_PAGE_LABELS, PRESENTATION_PAGE_ORDER } from './pageOrder.ts'
import {
  PITCH_GEOGRAPHY_CALLOUTS,
  PITCH_GEOGRAPHY_CHANNELS,
  PITCH_GEOGRAPHY_DEFAULT_MODE,
  PITCH_GEOGRAPHY_MODES,
  PITCH_GEOGRAPHY_ZONES,
} from './pitchGeographyPageData.ts'

test('Pitch Geography is page 4 between Our Identity and Game Analysis', () => {
  assert.deepEqual(PRESENTATION_PAGE_ORDER.slice(0, 5), [
    'cover',
    'intro',
    'philosophy',
    'pitch-geography',
    'game-analysis',
  ])
  assert.equal(PRESENTATION_PAGE_ORDER.length, 15)
  assert.equal(PRESENTATION_PAGE_LABELS['pitch-geography'], 'Pitch Geography')
})

test('Pitch Geography defaults to Zones and exposes all three view controls', () => {
  assert.equal(PITCH_GEOGRAPHY_DEFAULT_MODE, 'zones')
  assert.deepEqual(PITCH_GEOGRAPHY_MODES, [
    { id: 'zones', label: 'Zones' },
    { id: 'channels', label: 'Channels' },
    { id: 'both', label: 'Both' },
  ])
})

test('Pitch Geography derives its four horizontal bands from canonical pitch zones', () => {
  assert.deepEqual(
    PITCH_GEOGRAPHY_ZONES.map(({ label, startY, endY }) => ({ label, startY, endY })),
    [...PITCH.ZONES],
  )
  assert.deepEqual(
    PITCH_GEOGRAPHY_ZONES.map((zone) => `${zone.label} — ${zone.primary} / ${zone.secondary}`),
    [
      'Zone 1 — Build Up / Protect Goal',
      'Zone 2 — Unbalance / Security & Progression',
      'Zone 3 — Supply / Creation',
      'Zone 4 — Penetrate / Final Action',
    ],
  )
})

test('Pitch Geography preserves the mirrored canonical six-channel order', () => {
  assert.deepEqual(
    PITCH_GEOGRAPHY_CHANNELS.map(({ id, startX, endX }) => ({ id, startX, endX })),
    PITCH.CHANNELS.map(({ id, startX, endX }) => ({ id, startX, endX })),
  )
  assert.deepEqual(
    PITCH_GEOGRAPHY_CHANNELS.map((channel) => `Channel ${channel.channelNumber} — ${channel.description}`),
    [
      'Channel 1 — Wide',
      'Channel 2 — Half-space',
      'Channel 3 — Central',
      'Channel 3 — Central',
      'Channel 2 — Half-space',
      'Channel 1 — Wide',
    ],
  )
})

test('Pitch Geography includes the required organization callouts', () => {
  assert.deepEqual(
    PITCH_GEOGRAPHY_CALLOUTS.map((callout) => callout.title),
    ['Attacking Organization', 'Defensive Organization'],
  )
  assert.match(PITCH_GEOGRAPHY_CALLOUTS[0].text, /Channel 1 width.*Channel 2 support.*Channel 3 central penetration/)
  assert.match(PITCH_GEOGRAPHY_CALLOUTS[1].text, /Protect Zones 1\/2.*deny Channel 3.*Channel 1/)
})

test('App registers the Pitch Geography route with its dedicated static page', () => {
  const appSource = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8')
  const pageSource = readFileSync(new URL('../pages/PitchGeographyPage.tsx', import.meta.url), 'utf8')

  assert.match(appSource, /path="\/presentation\/pitch-geography"/)
  assert.match(appSource, /element=\{<PitchGeographyPage \/>\}/)
  assert.match(pageSource, /<PresentationLayout pageId="pitch-geography"/)
  assert.doesNotMatch(pageSource, /PixiPitchPreview/)
  assert.doesNotMatch(pageSource, /ballPosition|players=/)
})
