import { Graphics } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import { PITCH } from '../../../domain/pitch/pitchConstants'

const LINE_COLOR = 0xffffff
const NET_LINE_ALPHA = 0.34
const DEPTH_LINE_ALPHA = 0.56
const NET_LINE_WIDTH = 1
const DEPTH_LINE_WIDTH = 1.75
const POST_WIDTH = 3
const CROSSBAR_WIDTH = 3
const NET_GRID_DIVISIONS = 6

function drawGoal(
  goalsLayer: Graphics,
  goalLineY: number,
  isOwnGoal: boolean,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const goalCenterX = PITCH.WIDTH / 2
  const halfGoalWidth = PITCH.GOAL_WIDTH / 2
  const depthDirection = isOwnGoal ? -1 : 1
  const backNetY = goalLineY + depthDirection * PITCH.GOAL_DEPTH

  const postLeft = pitchToScreen(goalCenterX - halfGoalWidth, goalLineY, canvasW, canvasH, padding)
  const postRight = pitchToScreen(goalCenterX + halfGoalWidth, goalLineY, canvasW, canvasH, padding)
  const backLeft = pitchToScreen(goalCenterX - halfGoalWidth, backNetY, canvasW, canvasH, padding)
  const backRight = pitchToScreen(goalCenterX + halfGoalWidth, backNetY, canvasW, canvasH, padding)

  goalsLayer.moveTo(backLeft.sx, backLeft.sy)
  goalsLayer.lineTo(backRight.sx, backRight.sy)
  goalsLayer.stroke({ color: LINE_COLOR, width: NET_LINE_WIDTH, alpha: NET_LINE_ALPHA })

  goalsLayer.moveTo(postLeft.sx, postLeft.sy)
  goalsLayer.lineTo(backLeft.sx, backLeft.sy)
  goalsLayer.stroke({ color: LINE_COLOR, width: DEPTH_LINE_WIDTH, alpha: DEPTH_LINE_ALPHA })

  goalsLayer.moveTo(postRight.sx, postRight.sy)
  goalsLayer.lineTo(backRight.sx, backRight.sy)
  goalsLayer.stroke({ color: LINE_COLOR, width: DEPTH_LINE_WIDTH, alpha: DEPTH_LINE_ALPHA })

  goalsLayer.moveTo(postLeft.sx, postLeft.sy)
  goalsLayer.lineTo(postRight.sx, postRight.sy)
  goalsLayer.stroke({ color: LINE_COLOR, width: CROSSBAR_WIDTH, alpha: DEPTH_LINE_ALPHA })

  const postTickDir = isOwnGoal ? 1 : -1

  goalsLayer.moveTo(postLeft.sx, postLeft.sy)
  goalsLayer.lineTo(postLeft.sx, postLeft.sy + postTickDir * 4)
  goalsLayer.stroke({ color: LINE_COLOR, width: POST_WIDTH, alpha: DEPTH_LINE_ALPHA })

  goalsLayer.moveTo(postRight.sx, postRight.sy)
  goalsLayer.lineTo(postRight.sx, postRight.sy + postTickDir * 4)
  goalsLayer.stroke({ color: LINE_COLOR, width: POST_WIDTH, alpha: DEPTH_LINE_ALPHA })

  for (let i = 1; i < NET_GRID_DIVISIONS; i += 1) {
    const t = i / NET_GRID_DIVISIONS
    const topX = postLeft.sx + (postRight.sx - postLeft.sx) * t
    const topY = postLeft.sy + (postRight.sy - postLeft.sy) * t
    const bottomX = backLeft.sx + (backRight.sx - backLeft.sx) * t
    const bottomY = backLeft.sy + (backRight.sy - backLeft.sy) * t

    goalsLayer.moveTo(topX, topY)
    goalsLayer.lineTo(bottomX, bottomY)
    goalsLayer.stroke({ color: LINE_COLOR, width: 0.5, alpha: NET_LINE_ALPHA * 0.5 })
  }
}

export function drawGoals(
  goalsLayer: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  goalsLayer.clear()

  drawGoal(goalsLayer, 0, true, canvasW, canvasH, padding)
  drawGoal(goalsLayer, PITCH.LENGTH, false, canvasW, canvasH, padding)
}
