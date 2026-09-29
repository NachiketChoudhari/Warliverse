import type { HumanFigureGeometry, Point2D } from '../grammar/types'

export type PoseLandmarkName =
  | 'nose'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftWrist'
  | 'rightWrist'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle'

export interface PoseLandmark {
  x: number
  y: number
  z?: number
  visibility?: number
  presence?: number
}

export type PoseLandmarks = Partial<Record<PoseLandmarkName, PoseLandmark>>

export interface PoseBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface NormalizedPose {
  landmarks: PoseLandmarks
  bounds: PoseBounds | null
  landmarkCount: number
  visibleLandmarkCount: number
  coordinateSpace: 'body-relative-100'
  mirrored: boolean
}

export interface WarliPoseStructure {
  motif: 'human'
  geometry: HumanFigureGeometry
  normalizedLandmarks: PoseLandmarks
}

export interface PoseDebugData {
  landmarkCount: number
  visibleLandmarks: number
  updateCount: number
  normalizedLandmarks: PoseLandmarks
}

export type DemoPoseState = 'Idle' | 'Walking' | 'Raising arms' | 'Dancing'

export interface PosePoint extends Point2D {
  visibility?: number
}
