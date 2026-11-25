import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const SECTIONS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#security', label: 'Privacy' },
  { href: '#faq', label: 'FAQ' },
]

// Header for the public pages (landing). Section links hide on phones; Sign in always shows.
export function PublicHeader() {
  const { status } = useAuth()
  const signedIn = status === 'signed-in'
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-control bg-accent px-3 py-2 text-body font-medium text-on-accent focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link to="/" aria-label="PinPoint home" className="rounded-control">
          <Logo />
        </Link>
        <nav aria-label="Sections" className="hidden flex-1 items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} className="rounded-control px-3 py-2 text-body text-muted transition-colors hover:text-text">
              {s.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <Link
              to="/workspaces"
              className="inline-flex h-9 items-center rounded-control bg-accent px-3.5 text-body font-medium text-on-accent transition-colors hover:bg-accent-hover"
            >
              Open app
            </Link>
          ) : (
            <Link
              to="/signin"
              className="inline-flex h-9 items-center rounded-control bg-accent px-3.5 text-body font-medium text-on-accent transition-colors hover:bg-accent-hover"
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
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-small text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo size={22} />
        <p>Built by Team Lukydizy at ALMA Future Forge 2026.</p>
      </div>
    </footer>
  )
}
