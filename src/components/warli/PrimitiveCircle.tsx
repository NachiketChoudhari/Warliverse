import type { TransformProps } from '../../grammar/types'

type PrimitiveCircleProps = TransformProps & {
  center: { x: number; y: number }
  radius: number
  stroke?: string
  fill?: string
}

export function PrimitiveCircle({ center, radius, position = { x: 0, y: 0 }, scale = 1, rotation = 0, strokeWidth = 2, opacity = 1, className, stroke = 'currentColor', fill = 'none' }: PrimitiveCircleProps) {
  return <g className={className} transform={`translate(${position.x} ${position.y}) rotate(${rotation}) scale(${scale})`} opacity={opacity}>
    <circle cx={center.x} cy={center.y} r={radius} fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
  </g>
}
