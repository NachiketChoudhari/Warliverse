import { PrimitiveCircle } from './PrimitiveCircle'
import { PrimitiveLine } from './PrimitiveLine'
import { motifTransform, type MotifProps } from './motifProps'

export function AnimalMotif({ position, scale, rotation, strokeWidth = 2, opacity = 1, className }: MotifProps) {
  return <g className={className} transform={motifTransform({ position, scale, rotation })} opacity={opacity}>
    <PrimitiveLine start={{ x: 23, y: 48 }} end={{ x: 69, y: 48 }} strokeWidth={strokeWidth} />
    <PrimitiveCircle center={{ x: 75, y: 43 }} radius={7} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 33, y: 49 }} end={{ x: 29, y: 75 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 45, y: 49 }} end={{ x: 43, y: 75 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 61, y: 49 }} end={{ x: 64, y: 75 }} strokeWidth={strokeWidth} />
    <PrimitiveLine start={{ x: 22, y: 48 }} end={{ x: 14, y: 39 }} strokeWidth={strokeWidth} />
  </g>
}
