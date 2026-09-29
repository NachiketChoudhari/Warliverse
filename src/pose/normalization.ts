import type { NormalizedPose, PoseBounds, PoseLandmarks } from './types'
import { isLandmarkVisible, POSE_LANDMARK_NAMES, POSE_VISIBILITY_THRESHOLD } from './poseUtils'

export interface NormalizePoseOptions {
  visibilityThreshold?: number
  mirrorX?: boolean
}

const outputMin = 10
const outputSpan = 80

/** Normalizes visible points to a body-relative 100×100 renderer space using the pose bounding box. */
export function normalizeLandmarks(landmarks: PoseLandmarks, options: NormalizePoseOptions = {}): NormalizedPose {
  const threshold = options.visibilityThreshold ?? POSE_VISIBILITY_THRESHOLD
  const visible = POSE_LANDMARK_NAMES.flatMap((name) => {
    const point = landmarks[name]
    return isLandmarkVisible(point, threshold) ? [[name, point] as const] : []
  })
  if (visible.length === 0) {
    return { landmarks: {}, bounds: null, landmarkCount: Object.keys(landmarks).length, visibleLandmarkCount: 0, coordinateSpace: 'body-relative-100', mirrored: options.mirrorX ?? false }
  }

  const xs = visible.map(([, point]) => point.x)
  const ys = visible.map(([, point]) => point.y)
  const bounds: PoseBounds = {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  }
  const centerX = (bounds.minX + bounds.maxX) / 2
  const maxSpan = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, Number.EPSILON)
  const scale = outputSpan / maxSpan
  const normalized: PoseLandmarks = {}

  visible.forEach(([name, point]) => {
    const x = 50 + (point.x - centerX) * scale
    normalized[name] = {
      ...point,
      x: options.mirrorX ? 100 - x : x,
      y: outputMin + (point.y - bounds.minY) * scale,
    }
  })

  return {
    landmarks: normalized,
    bounds,
    landmarkCount: Object.keys(landmarks).length,
    visibleLandmarkCount: visible.length,
    coordinateSpace: 'body-relative-100',
    mirrored: options.mirrorX ?? false,
  }
}
