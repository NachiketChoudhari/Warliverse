import type { TransformProps } from '../../grammar/types'

export type MotifProps = TransformProps

export function motifTransform({ position = { x: 0, y: 0 }, scale = 1, rotation = 0 }: MotifProps): string {
  return `translate(${position.x} ${position.y}) rotate(${rotation}) scale(${scale})`
}
