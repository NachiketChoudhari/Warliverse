import type { ProductConfiguration } from '../products/types'

/** Deterministic product presentation configurations; none carry cultural claims. */
export const products = [
  {
    id: 'wall-art', name: 'Wall Art', description: 'A framed portrait composition for a wall display.', aspectRatio: '4:5',
    canvas: { width: 480, height: 600 }, safeArea: { x: 54, y: 60, width: 372, height: 480 },
    shape: 'framed-rectangle', layoutType: 'portrait',
    preview: { clipShape: 'rect', frameInset: 22, background: '#e8dfcf' },
  },
  {
    id: 'hotel-plate', name: 'Hotel Plate', description: 'A circular plate preview with a contained central composition.', aspectRatio: '1:1',
    canvas: { width: 560, height: 560 }, safeArea: { x: 120, y: 120, width: 320, height: 320 },
    shape: 'circle', layoutType: 'circular',
    preview: { clipShape: 'circle', frameInset: 30, background: '#e8dfcf' },
  },
  {
    id: 'phone-cover', name: 'Phone Cover', description: 'A tall cover preview with reserved top and edge margins.', aspectRatio: '9:19',
    canvas: { width: 360, height: 760 }, safeArea: { x: 48, y: 150, width: 264, height: 520 },
    shape: 'rounded-rectangle', layoutType: 'portrait',
    preview: { clipShape: 'rounded-rectangle', frameInset: 14, frameRadius: 40, background: '#302d29' },
  },
  {
    id: 'textile-border', name: 'Textile Border', description: 'A wide strip that repeats the mapped arrangement horizontally.', aspectRatio: '4:1',
    canvas: { width: 960, height: 240 }, safeArea: { x: 24, y: 28, width: 912, height: 184 },
    shape: 'textile-strip', layoutType: 'horizontal',
    preview: { clipShape: 'rect', frameInset: 12, background: '#e8dfcf', repeatCount: 3 },
  },
] as const satisfies readonly ProductConfiguration[]
