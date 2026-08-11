import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('./MethodologyPage.tsx', import.meta.url), 'utf8')

test('methodology names all five Module 2 SCORE training design principles', () => {
  assert.match(source, /My training design principles — SCORE/)
  assert.match(source, /Soccer Problem/)
  assert.match(source, /Challenge/)
  assert.match(source, /Opposition/)
  assert.match(source, /Realism/)
  assert.match(source, /Enjoyment/)
})

test('SCORE is explicitly connected to Whole-Part-Whole design and evaluation', () => {
  assert.match(source, /design and evaluate every Whole-Part-Whole session/)
  assert.match(source, /repeats without the same picture repeating/)
  assert.match(source, /decisions can transfer to the game/)
})

test('each Whole-Part-Whole stage owns a distinct live checklist', () => {
  assert.match(source, /Can they see the problem\?/)
  assert.match(source, /Is the relationship improving\?/)
  assert.match(source, /Did it transfer\?/)
  assert.match(source, /activeStep\.checks\.map/)
  assert.match(source, /aria-live="polite"/)
})
