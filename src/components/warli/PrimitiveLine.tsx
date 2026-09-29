import type { TransformProps } from '../../grammar/types'

type PrimitiveLineProps = TransformProps & {
  start: { x: number; y: number }
  end: { x: number; y: number }
  stroke?: string
}

export function PrimitiveLine({ start, end, position = { x: 0, y: 0 }, scale = 1, rotation = 0, strokeWidth = 2, opacity = 1, className, stroke = 'currentColor' }: PrimitiveLineProps) {
  return <g className={className} transform={`translate(${position.x} ${position.y}) rotate(${rotation}) scale(${scale})`} opacity={opacity}>
    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </g>
}
