import { describe, expect, it } from 'vitest'
import { normalizeLandmarks } from './normalization'
import { mapNormalizedPoseToWarli, mapPoseToWarliFigure } from './poseMapper'
import { getDemoPose, getHipCenter, getShoulderCenter } from './poseUtils'
import type { PoseLandmarks } from './types'

const mockLandmarks: PoseLandmarks = {
  nose: { x: 0.5, y: 0.1, visibility: 1 },
  leftShoulder: { x: 0.3, y: 0.3, visibility: 1 },
  rightShoulder: { x: 0.7, y: 0.3, visibility: 1 },
  leftElbow: { x: 0.2, y: 0.45, visibility: 1 },
  rightElbow: { x: 0.8, y: 0.45, visibility: 1 },
  leftWrist: { x: 0.1, y: 0.6, visibility: 1 },
  rightWrist: { x: 0.9, y: 0.6, visibility: 1 },
  leftHip: { x: 0.4, y: 0.6, visibility: 1 },
  rightHip: { x: 0.6, y: 0.6, visibility: 1 },
  leftKnee: { x: 0.4, y: 0.8, visibility: 1 },
  rightKnee: { x: 0.6, y: 0.8, visibility: 1 },
  leftAnkle: { x: 0.35, y: 0.95, visibility: 1 },
  rightAnkle: { x: 0.65, y: 0.95, visibility: 1 },
}

describe('Pose Mirror mapping', () => {
  it('normalizes landmarks into a stable body-relative coordinate range', () => {
    const result = normalizeLandmarks({
      leftShoulder: { x: 0.2, y: 0.2, visibility: 1 },
      rightAnkle: { x: 0.8, y: 0.8, visibility: 1 },
    })
    expect(result.coordinateSpace).toBe('body-relative-100')
    expect(result.landmarks.leftShoulder?.x).toBeCloseTo(10)
    expect(result.landmarks.rightAnkle?.x).toBeCloseTo(90)
    expect(result.landmarks.leftShoulder?.y).toBeCloseTo(10)
    expect(result.landmarks.rightAnkle?.y).toBeCloseTo(90)
  })

  it('handles missing and low-visibility landmarks safely', () => {
    const result = normalizeLandmarks({ nose: { x: 0.2, y: 0.3, visibility: 0.1 } })
    expect(result.landmarkCount).toBe(1)
    expect(result.visibleLandmarkCount).toBe(0)
    expect(mapPoseToWarliFigure(result)).toBeNull()
    expect(mapNormalizedPoseToWarli({ leftWrist: { x: 5, y: 5, visibility: 1 } })?.geometry.leftArm).toBeUndefined()
  })

  it('calculates shoulder center', () => {
    expect(getShoulderCenter(mockLandmarks)).toEqual({ x: 0.5, y: 0.3 })
  })

  it('calculates hip center', () => {
    expect(getHipCenter(mockLandmarks)).toEqual({ x: 0.5, y: 0.6 })
  })

  it('maps the nose to a circle head', () => {
    const figure = mapNormalizedPoseToWarli(mockLandmarks)
    expect(figure?.geometry.head?.center).toEqual({ x: 0.5, y: 0.1 })
    expect(figure?.geometry.head?.radius).toBeGreaterThan(0)
  })

  it('maps shoulder and hip centers to a triangle body', () => {
    expect(mapNormalizedPoseToWarli(mockLandmarks)?.geometry.body).toEqual([
      { x: 0.5, y: 0.3 }, { x: 0.4, y: 0.6 }, { x: 0.6, y: 0.6 },
    ])
  })

  it('maps arms as shoulder-elbow-wrist line segments', () => {
    const figure = mapNormalizedPoseToWarli(mockLandmarks)
    expect(figure?.geometry.leftArm).toEqual([
      { start: { x: 0.3, y: 0.3 }, end: { x: 0.2, y: 0.45 } },
      { start: { x: 0.2, y: 0.45 }, end: { x: 0.1, y: 0.6 } },
    ])
  })

  it('maps legs as hip-knee-ankle line segments', () => {
    const figure = mapNormalizedPoseToWarli(mockLandmarks)
    expect(figure?.geometry.rightLeg).toEqual([
      { start: { x: 0.6, y: 0.6 }, end: { x: 0.6, y: 0.8 } },
      { start: { x: 0.6, y: 0.8 }, end: { x: 0.65, y: 0.95 } },
    ])
  })

  it('mirrors X around the centerline when requested', () => {
    const source = { leftShoulder: mockLandmarks.leftShoulder, rightAnkle: mockLandmarks.rightAnkle }
    const normal = normalizeLandmarks(source)
    const mirrored = normalizeLandmarks(source, { mirrorX: true })
    expect(mirrored.landmarks.leftShoulder?.x).toBe(100 - (normal.landmarks.leftShoulder?.x ?? 0))
    expect(mirrored.mirrored).toBe(true)
  })

  it('converts a deterministic demo pose through the shared Warli structure mapping', () => {
    const first = mapPoseToWarliFigure(normalizeLandmarks(getDemoPose(0), { mirrorX: true }))
    const repeated = mapPoseToWarliFigure(normalizeLandmarks(getDemoPose(0), { mirrorX: true }))
    expect(first).toEqual(repeated)
    expect(first?.motif).toBe('human')
    expect(first?.geometry.head).toBeDefined()
    expect(first?.geometry.body).toHaveLength(3)
  })
})
