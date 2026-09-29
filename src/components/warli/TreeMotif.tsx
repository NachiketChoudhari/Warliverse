import { PrimitiveCircle } from './PrimitiveCircle'
import { PrimitiveLine } from './PrimitiveLine'
import { PrimitiveTriangle } from './PrimitiveTriangle'
import { motifTransform, type MotifProps } from './motifProps'

export function TreeMotif({ position, scale, rotation, strokeWidth = 2, opacity = 1, className }: MotifProps) {
  return <g className={className} transform={motifTransform({ position, scale, rotation })} opacity={opacity}>
    <PrimitiveLine start={{ x: 50, y: 44 }} end={{ x: 50, y: 86 }} strokeWidth={strokeWidth} />
    <PrimitiveTriangle points={['50,12', '27,54', '73,54']} strokeWidth={strokeWidth} />
    <PrimitiveCircle center={{ x: 50, y: 20 }} radius={3} strokeWidth={strokeWidth} />
  </g>
}
