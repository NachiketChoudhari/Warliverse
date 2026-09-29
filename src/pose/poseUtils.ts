import type { PoseLandmark, PoseLandmarkName, PoseLandmarks, PosePoint, DemoPoseState } from './types'

export const POSE_LANDMARK_NAMES: readonly PoseLandmarkName[] = [
  'nose', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
  'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle',
]

export const POSE_VISIBILITY_THRESHOLD = 0.25

export function landmarkConfidence(landmark: PoseLandmark): number {
  return landmark.visibility ?? landmark.presence ?? 1
}

export function isLandmarkVisible(landmark: PoseLandmark | undefined, threshold = POSE_VISIBILITY_THRESHOLD): landmark is PoseLandmark {
  return landmark !== undefined
    && Number.isFinite(landmark.x)
    && Number.isFinite(landmark.y)
    && landmarkConfidence(landmark) >= threshold
}

export function getVisibleLandmarkCount(landmarks: PoseLandmarks, threshold = POSE_VISIBILITY_THRESHOLD): number {
  return POSE_LANDMARK_NAMES.filter((name) => isLandmarkVisible(landmarks[name], threshold)).length
}

export function getMidpoint(left: PosePoint | undefined, right: PosePoint | undefined): PosePoint | null {
  if (!left || !right) return null
  return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 }
}

export function getShoulderCenter(landmarks: PoseLandmarks): PosePoint | null {
  return getMidpoint(landmarks.leftShoulder, landmarks.rightShoulder)
}

export function getHipCenter(landmarks: PoseLandmarks): PosePoint | null {
  return getMidpoint(landmarks.leftHip, landmarks.rightHip)
}

export function getDemoPoseState(frame: number): DemoPoseState {
  return (['Idle', 'Walking', 'Raising arms', 'Dancing'] as const)[Math.floor(frame / 45) % 4]
}

/** Deterministic pseudo-landmarks for the fallback mode; processed by the same mapper as camera poses. */
export function getDemoPose(frame: number): PoseLandmarks {
  const phase = Math.floor(frame / 45) % 4
  const oscillation = Math.sin(frame * 0.09) * 0.04
  const pose: PoseLandmarks = {
    nose: { x: 0.5, y: 0.12, visibility: 1 },
    leftShoulder: { x: 0.42, y: 0.29, visibility: 1 },
    rightShoulder: { x: 0.58, y: 0.29, visibility: 1 },
    leftElbow: { x: 0.35, y: 0.4, visibility: 1 },
    rightElbow: { x: 0.65, y: 0.4, visibility: 1 },
    leftWrist: { x: 0.3, y: 0.52, visibility: 1 },
    rightWrist: { x: 0.7, y: 0.52, visibility: 1 },
    leftHip: { x: 0.45, y: 0.56, visibility: 1 },
    rightHip: { x: 0.55, y: 0.56, visibility: 1 },
    leftKnee: { x: 0.44, y: 0.73, visibility: 1 },
    rightKnee: { x: 0.56, y: 0.73, visibility: 1 },
    leftAnkle: { x: 0.43, y: 0.92, visibility: 1 },
    rightAnkle: { x: 0.57, y: 0.92, visibility: 1 },
  }

  if (phase === 1) {
    pose.leftWrist = { x: 0.29, y: 0.48 + oscillation, visibility: 1 }
    pose.rightWrist = { x: 0.71, y: 0.56 - oscillation, visibility: 1 }
    pose.leftKnee = { x: 0.4, y: 0.7, visibility: 1 }
    pose.rightKnee = { x: 0.59, y: 0.76, visibility: 1 }
  } else if (phase === 2) {
    pose.leftElbow = { x: 0.35, y: 0.2, visibility: 1 }
    pose.rightElbow = { x: 0.65, y: 0.2, visibility: 1 }
    pose.leftWrist = { x: 0.27, y: 0.08, visibility: 1 }
    pose.rightWrist = { x: 0.73, y: 0.08, visibility: 1 }
  } else if (phase === 3) {
    pose.leftElbow = { x: 0.3, y: 0.28 + oscillation, visibility: 1 }
    pose.leftWrist = { x: 0.22, y: 0.14 + oscillation, visibility: 1 }
    pose.rightElbow = { x: 0.68, y: 0.4, visibility: 1 }
    pose.rightWrist = { x: 0.76, y: 0.31, visibility: 1 }
    pose.leftKnee = { x: 0.38, y: 0.69, visibility: 1 }
    pose.rightKnee = { x: 0.62, y: 0.78, visibility: 1 }
  }

  return pose
}
