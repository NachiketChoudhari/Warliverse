import { products } from '../../data/products'
import type { ProductId } from '../../products'

function ProductShape({ shape }: { shape: string }) {
  const common = 'border-2 border-terracotta/70 bg-paper'
  if (shape === 'circle') return <span className={`size-12 rounded-full ${common}`} aria-hidden="true" />
  if (shape === 'rounded-rectangle') return <span className={`h-14 w-8 rounded-xl ${common}`} aria-hidden="true" />
  if (shape === 'textile-strip') return <span className={`h-7 w-16 ${common}`} aria-hidden="true" />
  return <span className={`h-14 w-11 ${common}`} aria-hidden="true" />
}

export function ProductSelector({ selectedProductId, onSelect }: {
  selectedProductId: ProductId | null
  onSelect: (productId: ProductId) => void
}) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {products.map((product) => <button key={product.id} type="button" onClick={() => onSelect(product.id)} aria-pressed={selectedProductId === product.id} className={`flex min-h-32 items-center gap-4 border p-4 text-left transition-colors ${selectedProductId === product.id ? 'border-terracotta bg-white/50' : 'border-line hover:border-terracotta/60'}`}>
      <span className="grid size-20 shrink-0 place-items-center"><ProductShape shape={product.shape} /></span>
      <span><span className="block font-medium">{product.name}</span><span className="mt-1 block text-xs leading-5 text-muted">{product.description}</span><span className="mt-2 block text-[10px] uppercase tracking-wide text-muted">{product.aspectRatio} · {product.layoutType}</span></span>
    </button>)}
  </div>
}
