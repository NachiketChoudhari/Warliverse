import type { HumanFigureGeometry, LineSegment, Point2D } from '../grammar/types'
import type { NormalizedPose, PoseLandmarkName, PoseLandmarks, WarliPoseStructure } from './types'
import { getShoulderCenter, isLandmarkVisible } from './poseUtils'

function getPoint(landmarks: PoseLandmarks, name: PoseLandmarkName): Point2D | null {
  const landmark = landmarks[name]
  return isLandmarkVisible(landmark) ? { x: landmark.x, y: landmark.y } : null
}

function connectAvailable(landmarks: PoseLandmarks, names: readonly PoseLandmarkName[]): LineSegment[] {
  const points = names.flatMap((name) => {
    const point = getPoint(landmarks, name)
    return point ? [point] : []
  })
  return points.slice(1).map((point, index) => ({ start: points[index], end: point }))
}

function headRadius(landmarks: PoseLandmarks): number {
  const left = getPoint(landmarks, 'leftShoulder')
  const right = getPoint(landmarks, 'rightShoulder')
  if (!left || !right) return 6
  // Proportional renderer setting only; it is not a documented cultural measurement.
  return Math.max(3, Math.min(9, Math.hypot(right.x - left.x, right.y - left.y) * 0.18))
}

/** Maps body-relative landmarks into geometry for the shared HumanFigure SVG component. */
export function mapNormalizedPoseToWarli(landmarks: PoseLandmarks): WarliPoseStructure | null {
  const geometry: HumanFigureGeometry = {}
  const nose = getPoint(landmarks, 'nose')
  if (nose) geometry.head = { center: nose, radius: headRadius(landmarks) }

  const shoulderCenter = getShoulderCenter(landmarks)
  const leftHip = getPoint(landmarks, 'leftHip')
  const rightHip = getPoint(landmarks, 'rightHip')
  if (shoulderCenter && leftHip && rightHip) {
    geometry.body = [shoulderCenter, leftHip, rightHip]
  }

  geometry.leftArm = connectAvailable(landmarks, ['leftShoulder', 'leftElbow', 'leftWrist'])
  geometry.rightArm = connectAvailable(landmarks, ['rightShoulder', 'rightElbow', 'rightWrist'])
  geometry.leftLeg = connectAvailable(landmarks, ['leftHip', 'leftKnee', 'leftAnkle'])
  geometry.rightLeg = connectAvailable(landmarks, ['rightHip', 'rightKnee', 'rightAnkle'])

  const hasGeometry = Boolean(
    geometry.head
    || geometry.body
    || geometry.leftArm?.length
    || geometry.rightArm?.length
    || geometry.leftLeg?.length
    || geometry.rightLeg?.length,
  )
  return hasGeometry ? { motif: 'human', geometry, normalizedLandmarks: landmarks } : null
}

export function mapPoseToWarliFigure(pose: NormalizedPose): WarliPoseStructure | null {
  return mapNormalizedPoseToWarli(pose.landmarks)
}
