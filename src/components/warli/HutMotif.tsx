import { PrimitiveLine } from './PrimitiveLine'
import { PrimitiveTriangle } from './PrimitiveTriangle'
import { motifTransform, type MotifProps } from './motifProps'

export function HutMotif({ position, scale, rotation, strokeWidth = 2, opacity = 1, className }: MotifProps) {
  return <g className={className} transform={motifTransform({ position, scale, rotation })} opacity={opacity}>
    <PrimitiveTriangle points={['50,15', '18,43', '82,43']} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 24, y: 43 }} end={{ x: 24, y: 82 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 76, y: 43 }} end={{ x: 76, y: 82 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 24, y: 82 }} end={{ x: 76, y: 82 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 46, y: 82 }} end={{ x: 46, y: 57 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 54, y: 82 }} end={{ x: 54, y: 57 }} strokeWidth={strokeWidth} />
  </g>
}
