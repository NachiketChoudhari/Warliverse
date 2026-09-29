import { PrimitiveCircle } from './PrimitiveCircle'
import { PrimitiveLine } from './PrimitiveLine'
import { motifTransform, type MotifProps } from './motifProps'

const rays = [
  [{ x: 50, y: 7 }, { x: 50, y: 19 }],
  [{ x: 50, y: 81 }, { x: 50, y: 93 }],
  [{ x: 7, y: 50 }, { x: 19, y: 50 }],
  [{ x: 81, y: 50 }, { x: 93, y: 50 }],
  [{ x: 20, y: 20 }, { x: 29, y: 29 }],
  [{ x: 71, y: 71 }, { x: 80, y: 80 }],
  [{ x: 20, y: 80 }, { x: 29, y: 71 }],
  [{ x: 71, y: 29 }, { x: 80, y: 20 }],
] as const

export function SunMotif({ position, scale, rotation, strokeWidth = 2, opacity = 1, className }: MotifProps) {
  return <g className={className} transform={motifTransform({ position, scale, rotation })} opacity={opacity}>
    <PrimitiveCircle center={{ x: 50, y: 50 }} radius={25} strokeWidth={strokeWidth} />
    {rays.map(([start, end], index) => <PrimitiveLine key={index} start={start} end={end} strokeWidth={strokeWidth} />)}
  </g>
}
