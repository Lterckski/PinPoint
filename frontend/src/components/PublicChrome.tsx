import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Logo } from './Logo'
import { ThemeSwitch } from './ThemeSwitch'

const SECTIONS = [
  { href: '#sources', label: 'Sources' },
  { href: '#formats', label: 'File types' },
  { href: '#privacy', label: 'Privacy' },
]

// Header for the public pages: a floating pill. Section links hide on phones; Sign in always shows.
export function PublicHeader() {
  const { status } = useAuth()
  const signedIn = status === 'signed-in'
  return (
    <header className="animate-fade-in sticky top-0 z-30 px-3 pt-3 sm:px-6">
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-control bg-accent px-3 py-2 text-body font-medium text-on-accent focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-[960px] items-center gap-6 rounded-pill border border-border bg-surface/85 pr-2 pl-5 shadow-card backdrop-blur-md">
        <Link to="/" aria-label="PinPoint home" className="rounded-control">
          <Logo size={22} />
        </Link>
        <nav aria-label="Sections" className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-control px-3.5 py-2 text-body text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-text"
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <div className="hidden sm:block">
            <ThemeSwitch />
          </div>
          <Link
            to={signedIn ? '/workspaces' : '/signin'}
            className="press inline-flex h-10 items-center rounded-control bg-accent px-4.5 text-body font-medium whitespace-nowrap text-on-accent hover:bg-accent-hover"
          >
            {signedIn ? 'Open app' : 'Sign in'}
          </Link>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="bg-bg">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-10 text-small text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo size={22} />
        <p>Built by Team Lukydizy at ALMA Future Forge 2026.</p>
      </div>
    </footer>
  )
}
