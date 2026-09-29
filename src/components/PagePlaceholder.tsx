type PagePlaceholderProps = {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">WARLI Studio</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted">
        This route is reserved for a later project phase.
      </p>
    </section>
  )
}
