import type { CSSProperties } from 'react'
import type { CanvasElement } from '../../grammar/types'
import { AnimalMotif } from './AnimalMotif'
import { HumanFigure } from './HumanFigure'
import { HutMotif } from './HutMotif'
import { SunMotif } from './SunMotif'
import { TreeMotif } from './TreeMotif'

export interface WarliCanvasProps {
  elements: readonly CanvasElement[]
  width?: number
  height?: number
  className?: string
  style?: CSSProperties
  label?: string
}

const renderers = {
  human: HumanFigure,
  tree: TreeMotif,
  hut: HutMotif,
  animal: AnimalMotif,
  sun: SunMotif,
}

/** Shared SVG viewport. Coordinates and motif geometry are presentation units configured by this prototype. */
export function WarliCanvas({ elements, width = 800, height = 420, className, style, label = 'Warli visual grammar canvas' }: WarliCanvasProps) {
  return <svg className={className} style={style} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
    <rect width={width} height={height} fill="#f7f3e9" />
    {elements.map((element) => {
      const Renderer = renderers[element.kind]
      return <Renderer
        key={element.id}
        position={element.position}
        scale={element.scale}
        rotation={element.rotation}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        className={element.className}
      />
    })}
  </svg>
}
