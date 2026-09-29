import { useCallback, useEffect, useRef, useState } from 'react'
import type { HumanFigureGeometry } from '../grammar/types'
import type { PoseDebugData, PoseLandmarks } from '../pose/types'
import { createPoseDetector, type LocalPoseDetector } from '../pose/poseDetector'
import { normalizeLandmarks } from '../pose/normalization'
import { mapPoseToWarliFigure } from '../pose/poseMapper'
import { getDemoPose, getDemoPoseState, getVisibleLandmarkCount, POSE_LANDMARK_NAMES } from '../pose/poseUtils'
import { HumanFigure } from '../components/warli/HumanFigure'

type RunMode = 'idle' | 'starting' | 'camera' | 'demo'

const skeletonLinks: readonly [string, string][] = [
  ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
  ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'], ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'], ['leftHip', 'rightHip'], ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'], ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
]

function CameraLandmarkOverlay({ landmarks }: { landmarks: PoseLandmarks }) {
  const point = (name: string) => landmarks[name as keyof PoseLandmarks]
  return <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
    {skeletonLinks.map(([from, to]) => {
      const start = point(from)
      const end = point(to)
      return start && end ? <line key={`${from}-${to}`} x1={1 - start.x} y1={start.y} x2={1 - end.x} y2={end.y} stroke="#a3482f" strokeWidth="0.006" /> : null
    })}
    {POSE_LANDMARK_NAMES.map((name) => {
      const landmark = landmarks[name]
      return landmark ? <circle key={name} cx={1 - landmark.x} cy={landmark.y} r="0.012" fill="#f7f3e9" stroke="#a3482f" strokeWidth="0.004" /> : null
    })}
  </svg>
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'Camera permission was denied. Allow camera access in your browser settings, or continue in Demo Mode.'
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') return 'No camera was found. Connect a camera or continue in Demo Mode.'
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') return 'The camera is unavailable or being used by another app. Close the other app or continue in Demo Mode.'
    return error.message
  }
  return 'Pose Mirror could not start. Check camera access or continue in Demo Mode.'
}

export function PoseMirrorPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const detectorRef = useRef<LocalPoseDetector | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const activeRef = useRef(false)
  const modeRef = useRef<RunMode>('idle')
  const generationRef = useRef(0)
  const lastProcessRef = useRef(0)
  const lastVideoTimeRef = useRef(-1)
  const lastTimestampRef = useRef(0)
  const updateCountRef = useRef(0)
  const [mode, setMode] = useState<RunMode>('idle')
  const [message, setMessage] = useState('Start the camera or use Demo Mode to see the pose mapping pipeline.')
  const [geometry, setGeometry] = useState<HumanFigureGeometry | null>(null)
  const [landmarks, setLandmarks] = useState<PoseLandmarks>({})
  const [debugData, setDebugData] = useState<PoseDebugData | null>(null)
  const [showLandmarks, setShowLandmarks] = useState(false)
  const [showPoseData, setShowPoseData] = useState(false)
  const [updateCount, setUpdateCount] = useState(0)
  const [demoState, setDemoState] = useState('')

  const stopCurrentMode = useCallback((notify = true) => {
    generationRef.current += 1
    activeRef.current = false
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    detectorRef.current?.close()
    detectorRef.current = null
    modeRef.current = 'idle'
    setMode('idle')
    if (notify) setMessage('Stopped. Start the camera or use Demo Mode when ready.')
  }, [])

  const processLandmarks = useCallback((raw: PoseLandmarks, currentMode: 'camera' | 'demo') => {
    const normalized = normalizeLandmarks(raw, { mirrorX: true })
    const mapped = mapPoseToWarliFigure(normalized)
    if (mapped) {
      setGeometry(mapped.geometry)
      setLandmarks(raw)
      setDemoState(currentMode === 'demo' ? getDemoPoseState(updateCountRef.current) : '')
    } else {
      setMessage('Move into camera view. The last complete Warli figure is being kept on screen.')
    }
    updateCountRef.current += 1
    setUpdateCount(updateCountRef.current)
    if (showPoseData) {
      setDebugData({
        landmarkCount: normalized.landmarkCount,
        visibleLandmarks: normalized.visibleLandmarkCount,
        updateCount: updateCountRef.current,
        normalizedLandmarks: normalized.landmarks,
      })
    }
  }, [showPoseData])

  const startDemo = useCallback(() => {
    stopCurrentMode(false)
    const generation = generationRef.current
    modeRef.current = 'demo'
    activeRef.current = true
    setMode('demo')
    setMessage('Deterministic simulated landmarks are passing through the same normalization and mapping pipeline as camera poses.')
    const loop = (time: number) => {
      if (!activeRef.current || generation !== generationRef.current || modeRef.current !== 'demo') return
      frameRef.current = requestAnimationFrame(loop)
      if (time - lastProcessRef.current < 60) return
      lastProcessRef.current = time
      processLandmarks(getDemoPose(updateCountRef.current), 'demo')
    }
    frameRef.current = requestAnimationFrame(loop)
  }, [processLandmarks, stopCurrentMode])

  const startCamera = useCallback(async () => {
    stopCurrentMode(false)
    const generation = generationRef.current
    setMode('starting')
    modeRef.current = 'starting'
    setMessage('Requesting camera access and loading the local pose model…')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser or page context. Use localhost or HTTPS, or continue in Demo Mode.')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      if (generation !== generationRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      if (!videoRef.current) throw new Error('Camera preview could not be initialized. Try Demo Mode.')
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      const detector = await createPoseDetector()
      if (generation !== generationRef.current) {
        detector.close()
        return
      }
      detectorRef.current = detector
      modeRef.current = 'camera'
      activeRef.current = true
      setMode('camera')
      setMessage('Camera is active. Move into view to update the structural figure.')
      const loop = (time: number) => {
        if (!activeRef.current || generation !== generationRef.current || modeRef.current !== 'camera') return
        frameRef.current = requestAnimationFrame(loop)
        const video = videoRef.current
        if (time - lastProcessRef.current < 60 || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.currentTime === lastVideoTimeRef.current) return
        lastProcessRef.current = time
        lastVideoTimeRef.current = video.currentTime
        const timestamp = Math.max(Math.round(time), lastTimestampRef.current + 1)
        lastTimestampRef.current = timestamp
        try {
          const pose = detectorRef.current?.detect(video, timestamp) ?? {}
          if (getVisibleLandmarkCount(pose) > 0) processLandmarks(pose, 'camera')
          else if (!geometry) setMessage('Move into camera view. Keep your upper body and limbs visible.')
        } catch (error) {
          setMessage(`Pose detection stopped: ${cameraErrorMessage(error)}`)
          stopCurrentMode(false)
        }
      }
      frameRef.current = requestAnimationFrame(loop)
    } catch (error) {
      if (generation === generationRef.current) {
        stopCurrentMode(false)
        setMessage(cameraErrorMessage(error))
      }
    }
  }, [geometry, processLandmarks, stopCurrentMode])

  useEffect(() => () => stopCurrentMode(false), [stopCurrentMode])

  return <div className="space-y-10">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Phase 5 · local pose interaction</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Pose Mirror</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">A pretrained pose-estimation component provides body landmarks. This project maps those landmarks into its configured human structure and shared SVG figure.</p>
    </header>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <section className="space-y-4" aria-labelledby="camera-title">
        <div className="flex items-center justify-between gap-4"><h2 id="camera-title" className="font-serif text-2xl">Camera input</h2><span className="rounded-full border border-line px-3 py-1 text-xs text-muted">{mode === 'camera' ? 'Live' : mode === 'demo' ? 'Demo Mode' : mode === 'starting' ? 'Starting' : 'Ready'}</span></div>
        <div className="relative aspect-video overflow-hidden rounded border border-line bg-[#e7dfce]">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" style={{ transform: 'scaleX(-1)' }} aria-label="Mirrored webcam preview" />
          {showLandmarks && mode === 'camera' && <CameraLandmarkOverlay landmarks={landmarks} />}
          {mode !== 'camera' && <div className="absolute inset-0 grid place-items-center p-5 text-center text-sm text-muted">{mode === 'demo' ? `DEMO MODE · ${demoState || 'Starting sequence'}` : 'Camera preview appears here when enabled.'}</div>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void startCamera()} disabled={mode === 'starting'} className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Start Camera</button>
          <button type="button" onClick={() => stopCurrentMode()} disabled={mode === 'idle'} className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-50">Stop</button>
          <button type="button" onClick={startDemo} className="rounded-full border border-terracotta px-4 py-2 text-sm text-terracotta">Demo Mode</button>
        </div>
        <p role="status" className="min-h-12 text-sm leading-6 text-muted">{message}</p>
        <p className="border-l-2 border-terracotta/40 pl-3 text-xs leading-5 text-muted">Camera frames are processed locally for this demonstration and are not uploaded.</p>
      </section>

      <section className="space-y-4" aria-labelledby="figure-title">
        <div className="flex items-center justify-between gap-3"><h2 id="figure-title" className="font-serif text-2xl">Warli structural figure</h2><span className="text-xs text-muted">{mode === 'demo' ? demoState : `${updateCount} updates`}</span></div>
        <div className="overflow-hidden rounded border border-line bg-[#f7f3e9]">
          <svg viewBox="0 0 300 220" className="block aspect-[4/3] w-full" role="img" aria-label="Warli figure mapped from pose landmarks">
            <rect width="300" height="220" fill="#f7f3e9" />
            {geometry ? <HumanFigure geometry={geometry} position={{ x: 100, y: 24 }} scale={1.75} strokeWidth={1.5} /> : <text x="150" y="110" textAnchor="middle" fill="#766e60" fontSize="12">Start camera or Demo Mode</text>}
          </svg>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={showLandmarks} onChange={(event) => setShowLandmarks(event.target.checked)} />Show Landmarks</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={showPoseData} onChange={(event) => setShowPoseData(event.target.checked)} />Show Pose Data</label>
        </div>
        {showPoseData && <div className="rounded border border-line bg-white/40 p-4 text-xs leading-5" aria-live="polite">
          <p>Input landmarks: {debugData?.landmarkCount ?? Object.keys(landmarks).length} · Visible: {debugData?.visibleLandmarks ?? getVisibleLandmarkCount(landmarks)} · Updates: {debugData?.updateCount ?? updateCount}</p>
          <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap">{JSON.stringify(debugData?.normalizedLandmarks ?? {}, null, 2)}</pre>
        </div>}
      </section>
    </div>

    <section className="border-t border-line pt-7">
      <h2 className="font-serif text-2xl">Mapping architecture</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">MediaPipe supplies pose landmarks. Our software maps those landmarks into the project’s configured Warli figure representation; MediaPipe does not interpret Warli art.</p>
      <ol className="mt-5 grid gap-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
        {['Camera', 'Pretrained Pose Estimation', 'Body Landmarks', 'Normalization', 'Warli Structural Mapping', 'SVG Rendering'].map((step, index) => <li key={step} className="flex min-h-16 items-center gap-2 border border-line bg-white/30 px-3 py-2"><span className="font-serif text-terracotta">{index + 1}</span>{step}</li>)}
      </ol>
      <p className="mt-4 text-xs text-muted">The webcam preview is mirrored for natural interaction; landmark X coordinates are inverted during normalization so the figure follows the same left/right movement.</p>
    </section>
  </div>
}
