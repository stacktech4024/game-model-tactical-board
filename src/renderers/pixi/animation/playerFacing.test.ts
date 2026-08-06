/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  facingAngleToSpriteRotation,
  getNearestEquivalentFacingAngle,
} from './playerFacing.ts'

test('facingAngleToSpriteRotation matches the player artwork convention', () => {
  assert.equal(facingAngleToSpriteRotation(0), -Math.PI / 2)
  assert.equal(facingAngleToSpriteRotation(90), 0)
  assert.equal(facingAngleToSpriteRotation(180), Math.PI / 2)
})

test('getNearestEquivalentFacingAngle uses the shortest visible turn', () => {
  assert.equal(getNearestEquivalentFacingAngle(-132, 65), -295)
  assert.equal(getNearestEquivalentFacingAngle(-90, 0), 0)
  assert.equal(getNearestEquivalentFacingAngle(350, 10), 370)
})
