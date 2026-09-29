import wasmLoaderPath from '@mediapipe/tasks-vision/vision_wasm_internal.js?url'
import wasmBinaryPath from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url'
import type { PoseLandmarker as MediaPipePoseLandmarker } from '@mediapipe/tasks-vision'
import type { PoseLandmarkName, PoseLandmarks } from './types'

export interface LocalPoseDetector {
  detect(video: HTMLVideoElement, timestampMs: number): PoseLandmarks
  close(): void
}

export class PoseDetectorInitializationError extends Error {
  readonly code: 'unsupported-browser' | 'model-init'

  constructor(message: string, code: 'unsupported-browser' | 'model-init') {
    super(message)
    this.name = 'PoseDetectorInitializationError'
    this.code = code
  }
}

const landmarkIndices: Readonly<Record<PoseLandmarkName, number>> = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
}

/** Initializes the pretrained MediaPipe task with same-origin model and WASM assets. */
export async function createPoseDetector(): Promise<LocalPoseDetector> {
  const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision')
  const simdSupported = await FilesetResolver.isSimdSupported()
  if (!simdSupported) {
    throw new PoseDetectorInitializationError(
      'This browser does not support the local SIMD runtime required by Pose Mirror. Try a current browser or use Demo Mode.',
      'unsupported-browser',
    )
  }

  const modelPath = new URL(`${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`, window.location.origin).href
  let landmarker: MediaPipePoseLandmarker
  try {
    landmarker = await PoseLandmarker.createFromOptions(
      { wasmLoaderPath, wasmBinaryPath },
      {
        baseOptions: { modelAssetPath: modelPath },
        runningMode: 'VIDEO',
        numPoses: 1,
        outputSegmentationMasks: false,
      },
    )
  } catch (error) {
    throw new PoseDetectorInitializationError(
      error instanceof Error ? `MediaPipe could not initialize: ${error.message}` : 'MediaPipe could not initialize. Use Demo Mode or retry in a supported browser.',
      'model-init',
    )
  }

  return {
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs)
      const detected = result.landmarks[0]
      if (!detected) return {}
      const landmarks: PoseLandmarks = {}
      Object.entries(landmarkIndices).forEach(([name, index]) => {
        const point = detected[index]
        if (point) landmarks[name as PoseLandmarkName] = { x: point.x, y: point.y, z: point.z, visibility: point.visibility }
      })
      return landmarks
    },
    close() {
      landmarker.close()
    },
  }
}
