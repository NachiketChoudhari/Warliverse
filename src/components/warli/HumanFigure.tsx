import { PrimitiveCircle } from './PrimitiveCircle'
import { PrimitiveLine } from './PrimitiveLine'
import { PrimitiveTriangle } from './PrimitiveTriangle'
import { motifTransform, type MotifProps } from './motifProps'
import type { HumanFigureGeometry, LineSegment } from '../../grammar/types'

type HumanFigureProps = MotifProps & { geometry?: HumanFigureGeometry }

const staticGeometry: HumanFigureGeometry = {
  head: { center: { x: 50, y: 18 }, radius: 8 },
  body: [{ x: 50, y: 28 }, { x: 34, y: 58 }, { x: 66, y: 58 }],
  leftArm: [{ start: { x: 37, y: 39 }, end: { x: 20, y: 51 } }],
  rightArm: [{ start: { x: 63, y: 39 }, end: { x: 80, y: 51 } }],
  leftLeg: [{ start: { x: 43, y: 56 }, end: { x: 37, y: 82 } }],
  rightLeg: [{ start: { x: 57, y: 56 }, end: { x: 63, y: 82 } }],
}

function renderSegments(segments: readonly LineSegment[] | undefined, strokeWidth: number) {
  return segments?.map((segment, index) => <PrimitiveLine key={index} start={segment.start} end={segment.end} strokeWidth={strokeWidth} />)
}

export function HumanFigure({ position, scale, rotation, strokeWidth = 2, opacity = 1, className, geometry = staticGeometry }: HumanFigureProps) {
  return <g className={className} transform={motifTransform({ position, scale, rotation })} opacity={opacity}>
    {geometry.head && <PrimitiveCircle center={geometry.head.center} radius={geometry.head.radius} strokeWidth={strokeWidth} />}
    {geometry.body && <PrimitiveTriangle points={geometry.body.map(({ x, y }) => `${x},${y}`) as [string, string, string]} strokeWidth={strokeWidth} />}
    {renderSegments(geometry.leftArm, strokeWidth)}
    {renderSegments(geometry.rightArm, strokeWidth)}
    {renderSegments(geometry.leftLeg, strokeWidth)}
    {renderSegments(geometry.rightLeg, strokeWidth)}
  </g>
}
