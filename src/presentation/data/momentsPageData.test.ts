import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PRESENTATION_PAGE_LABELS, PRESENTATION_PAGE_ORDER } from './pageOrder.ts'
import {
  GAME_MODEL_MOMENTS_STATEMENT,
  MOMENTS_CYCLE,
  MOMENTS_OF_THE_GAME,
  SET_PIECES_RELATIONSHIP,
} from './momentsPageData.ts'

test('the two team-shape pages connect Pitch Geography to Moments and Game Analysis', () => {
  assert.deepEqual(PRESENTATION_PAGE_ORDER.slice(2, 9), [
    'philosophy',
    'pitch-geography',
    'attacking-formation',
    'defensive-formation',
    'moments',
    'game-analysis',
    'attacking-transition',
  ])
  assert.equal(PRESENTATION_PAGE_LABELS.moments, 'Moments of the Game')
})

test('the four Moments use the evaluator copy in the required cycle order', () => {
  assert.deepEqual(
    MOMENTS_OF_THE_GAME.map(({ name, description }) => ({ name, description })),
    [
      {
        name: 'Attacking Organization',
        description: 'We have possession and organize to progress/create.',
      },
      {
        name: 'Defensive Transition',
        description: 'We lose possession and react immediately.',
      },
      {
        name: 'Defensive Organization',
        description: 'We organize without the ball to protect space and direct play.',
      },
      {
        name: 'Attacking Transition',
        description: 'We regain possession and decide whether to counter or secure.',
      },
    ],
  )

  assert.deepEqual(
    MOMENTS_CYCLE.map(({ from, to }) => [from, to]),
    [
      ['attacking-organization', 'defensive-transition'],
      ['defensive-transition', 'defensive-organization'],
      ['defensive-organization', 'attacking-transition'],
      ['attacking-transition', 'attacking-organization'],
    ],
  )
})

test('Set Pieces and the Game Model statement use the required evaluator language', () => {
  assert.deepEqual(SET_PIECES_RELATIONSHIP, {
    name: 'Set Pieces',
    description: 'Restarts can begin or change any Moment.',
  })
  assert.equal(
    GAME_MODEL_MOMENTS_STATEMENT,
    'Our Game Model gives players principles for each Moment so they can recognize what has changed and act together.',
  )
})

test('App exposes a dedicated, static, accessible Moments relationship page', () => {
  const appSource = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8')
  const pageSource = readFileSync(new URL('../pages/MomentsPage.tsx', import.meta.url), 'utf8')

  assert.match(appSource, /path="\/presentation\/moments"/)
  assert.match(appSource, /element=\{<MomentsPage \/>\}/)
  assert.match(pageSource, /<PresentationLayout pageId="moments"/)
  assert.match(pageSource, /aria-labelledby="moments-relationship-title"/)
  assert.match(pageSource, /aria-describedby="moments-relationship-description"/)
  assert.match(pageSource, /Set Pieces connect to every Moment/)
  assert.doesNotMatch(pageSource, /PixiPitchPreview|players=|ballPosition/)
})
