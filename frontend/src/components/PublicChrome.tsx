import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const SECTIONS = [
  { href: '#sources', label: 'Sources' },
  { href: '#formats', label: 'File types' },
  { href: '#privacy', label: 'Privacy' },
]

// Header for the public pages (landing). Section links hide on phones; Sign in always shows.
export function PublicHeader() {
  const { status } = useAuth()
  const signedIn = status === 'signed-in'
  return (
    <header className="animate-fade-in sticky top-0 z-30 border-b border-border bg-bg">
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-control bg-accent px-3 py-2 text-body font-medium text-on-accent focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-4 sm:px-8">
        <Link to="/" aria-label="PinPoint home" className="rounded-control">
          <Logo size={24} />
        </Link>
        <nav aria-label="Sections" className="hidden flex-1 items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} className="rounded-control px-3 py-2 text-body text-muted transition-colors duration-150 hover:text-text">
              {s.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          {signedIn ? (
            <Link
              to="/workspaces"
              className="press inline-flex h-9 items-center rounded-control bg-accent px-3.5 text-body font-medium whitespace-nowrap text-on-accent hover:bg-accent-hover"
            >
              Open app
            </Link>
          ) : (
            <Link
              to="/signin"
              className="press inline-flex h-9 items-center rounded-control bg-accent px-3.5 text-body font-medium whitespace-nowrap text-on-accent hover:bg-accent-hover"
            >
              Sign in
            </Link>
          )}
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
