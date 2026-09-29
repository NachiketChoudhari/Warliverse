import { PrimitiveCircle } from './PrimitiveCircle'
import { PrimitiveLine } from './PrimitiveLine'
import { PrimitiveTriangle } from './PrimitiveTriangle'
import { motifTransform, type MotifProps } from './motifProps'

export function HumanFigure({ position, scale, rotation, strokeWidth = 2, opacity = 1, className }: MotifProps) {
  return <g className={className} transform={motifTransform({ position, scale, rotation })} opacity={opacity}>
    <PrimitiveCircle center={{ x: 50, y: 18 }} radius={8} strokeWidth={strokeWidth} />
    <PrimitiveTriangle points={['50,28', '34,58', '66,58']} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 37, y: 39 }} end={{ x: 20, y: 51 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 63, y: 39 }} end={{ x: 80, y: 51 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 43, y: 56 }} end={{ x: 37, y: 82 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 57, y: 56 }} end={{ x: 63, y: 82 }} strokeWidth={strokeWidth} />
  </g>
}
