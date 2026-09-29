import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { PagePlaceholder } from './components/PagePlaceholder'
import { GrammarLabPage } from './pages/GrammarLabPage'

const navigation = [
  { label: 'Home', path: '/' },
  { label: 'Grammar', path: '/grammar' },
  { label: 'Deconstruct', path: '/deconstruct' },
  { label: 'Generator', path: '/generator' },
  { label: 'Pose Mirror', path: '/pose' },
  { label: 'Personalize', path: '/personalize' },
  { label: 'Archive', path: '/archive' },
]

function HomePage() {
  return (
    <section className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Aavishkar competition project</p>
      <h1 className="mt-5 max-w-2xl font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
        WARLI
        <span className="mt-2 block text-2xl font-normal tracking-normal text-terracotta sm:text-3xl">
          Visual Grammar &amp; Digital Preservation Studio
        </span>
      </h1>
      <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
        A workspace for exploring documented visual grammar, artwork structures, and digital preservation.
      </p>
      <div className="mt-10 border-l-2 border-terracotta/50 pl-5 text-sm leading-6 text-muted">
        Phase 1 establishes a structured software representation. Reference material will be added as it is documented.
      </div>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-paper text-ink">
        <header className="border-b border-line bg-paper/95">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <NavLink to="/" className="flex items-center gap-3" aria-label="WARLI home">
              <span className="grid size-10 place-items-center rounded-full border border-terracotta/40 font-serif text-lg text-terracotta">W</span>
              <span>
                <span className="block text-sm font-semibold tracking-[0.16em]">WARLI</span>
                <span className="block text-[11px] tracking-wide text-muted">Visual Grammar Studio</span>
              </span>
            </NavLink>
            <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:pb-0">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors ${isActive ? 'bg-terracotta text-white' : 'text-muted hover:bg-sand hover:text-ink'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/grammar" element={<GrammarLabPage />} />
            <Route path="/deconstruct" element={<PagePlaceholder title="Deconstruct" />} />
            <Route path="/generator" element={<PagePlaceholder title="Generator" />} />
            <Route path="/pose" element={<PagePlaceholder title="Pose Mirror" />} />
            <Route path="/personalize" element={<PagePlaceholder title="Personalize" />} />
            <Route path="/archive" element={<PagePlaceholder title="Archive" />} />
            <Route path="*" element={<PagePlaceholder title="Page not found" />} />
          </Routes>
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-7xl px-5 py-6 text-xs text-muted sm:px-8">
            WARLI — Visual Grammar &amp; Digital Preservation Studio
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
