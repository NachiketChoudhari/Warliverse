import type { TransformProps } from '../../grammar/types'

type PrimitiveTriangleProps = TransformProps & {
  points: readonly [string, string, string]
  stroke?: string
  fill?: string
}

export function PrimitiveTriangle({ points, position = { x: 0, y: 0 }, scale = 1, rotation = 0, strokeWidth = 2, opacity = 1, className, stroke = 'currentColor', fill = 'none' }: PrimitiveTriangleProps) {
  return <g className={className} transform={`translate(${position.x} ${position.y}) rotate(${rotation}) scale(${scale})`} opacity={opacity}>
    <polygon points={points.join(' ')} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </g>
}
