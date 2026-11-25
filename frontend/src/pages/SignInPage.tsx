import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { FullPageStatus } from '../components/FullPageStatus'
import { Logo } from '../components/Logo'
import { PasswordField } from '../components/PasswordField'
import { ApiError, USE_MOCKS } from '../lib/api'
import { safeNext, useAuth } from '../lib/auth'

const PASSWORD_MIN = 10

// Sign in, or (on a fresh install) create the owner account. Errors stay next to their field;
// the server's single "doesn't match" message never reveals which emails have accounts.
export function SignInPage() {
  const { status, signIn, setup, retry } = useAuth()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  if (status === 'loading') return <FullPageStatus kind="loading" />
  if (status === 'unreachable') return <FullPageStatus kind="unreachable" onRetry={retry} />
  if (status === 'signed-in') return <Navigate to={next} replace />

  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="PinPoint home" className="rounded-control">
            <Logo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-small text-muted hover:text-text">
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
            Home
          </Link>
        </div>
        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <div className="animate-rise-in w-full max-w-[380px]">
            {status === 'setup' ? <SetupForm onSubmit={setup} /> : <SignInForm onSubmit={signIn} />}
          </div>
        </main>
        <p className="flex items-center justify-center gap-1.5 text-label text-subtle">
          <LockKeyhole size={12} strokeWidth={1.75} aria-hidden="true" />
          Your files stay on this computer.
        </p>
      </div>
      <BrandPanel />
    </div>
  )
}

function errorText(e: unknown, fallback: string): string {
  if (e instanceof ApiError && e.status === 0) return "Can't reach the PinPoint server. Check that it's running."
  return e instanceof Error && e.message ? e.message : fallback
}

function SignInForm({ onSubmit }: { onSubmit: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => emailRef.current?.focus(), [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSubmit(email.trim(), password)
    } catch (err) {
      setError(errorText(err, "Couldn't sign in. Try again."))
      setPassword('')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[36px] leading-[1.1] tracking-[-0.015em] text-text">Welcome back</h1>
        <p className="text-body text-muted">Sign in to your workspaces.</p>
      </div>
      {USE_MOCKS && (
        <p className="rounded-control border border-accent-border bg-accent-soft px-3 py-2 text-small text-accent">
          Demo mode: any email and a password of {PASSWORD_MIN}+ characters.
        </p>
      )}
      <div className="flex flex-col gap-4">
        <Field
          ref={emailRef}
          label="Email"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@firm.ph"
          maxLength={254}
          required
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={256}
          required
        />
      </div>
      {error && (
        <p role="alert" className="-mt-2 rounded-control border border-danger/25 bg-danger-soft px-3 py-2 text-small text-danger">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={busy} className="w-full">
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-center text-small text-subtle">
        Forgot your password? Ask the person who set up PinPoint on this computer.
      </p>
    </form>
  )
}

type SetupErrors = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'form', string>>

function SetupForm({ onSubmit }: { onSubmit: (name: string, email: string, password: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<SetupErrors>({})
  const [busy, setBusy] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => nameRef.current?.focus(), [])

  const validate = (): SetupErrors => {
    const e: SetupErrors = {}
    if (!name.trim()) e.name = 'Enter your name.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) e.email = 'Enter a valid email address.'
    if (password.length < PASSWORD_MIN) e.password = `Use at least ${PASSWORD_MIN} characters.`
    else if (password.trim().toLowerCase() === email.trim().toLowerCase()) e.password = "Your password can't be your email address."
    if (!e.password && confirm !== password) e.confirm = "The passwords don't match."
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (busy) return
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`setup-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      await onSubmit(name.trim(), email.trim(), password)
    } catch (err) {
      setErrors({ form: errorText(err, "Couldn't create the account. Try again.") })
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow text-accent uppercase">First-time setup</p>
        <h1 className="font-serif text-[36px] leading-[1.1] tracking-[-0.015em] text-text">Set up PinPoint</h1>
        <p className="text-body text-muted">
          Create the owner account for this computer. You'll use it to sign in from now on.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Field
          ref={nameRef}
          id="setup-name"
          label="Your name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={80}
        />
        <Field
          id="setup-email"
          label="Work email"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          maxLength={254}
        />
        <PasswordField
          id="setup-password"
          label="Password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={`At least ${PASSWORD_MIN} characters. A short phrase is easiest to remember.`}
          error={errors.password}
          maxLength={256}
        />
        <PasswordField
          id="setup-confirm"
          label="Confirm password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          maxLength={256}
        />
      </div>
      {errors.form && (
        <p role="alert" className="-mt-2 rounded-control border border-danger/25 bg-danger-soft px-3 py-2 text-small text-danger">
          {errors.form}
        </p>
      )}
      <Button type="submit" size="lg" loading={busy} className="w-full">
        {busy ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}

/** The right half on large screens: the product's promise, shown as a cited passage. */
function BrandPanel() {
  return (
    <aside aria-hidden="true" className="relative hidden overflow-hidden border-l border-border bg-surface-muted lg:flex lg:items-center lg:justify-center">
      <div className="absolute inset-0 opacity-70 [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,var(--border)_31px,var(--border)_32px)]" />
      <div className="absolute inset-y-0 left-16 w-px bg-danger/25" />
      <div className="relative flex max-w-md flex-col gap-6 px-10">
        <p className="font-serif text-[34px] leading-[1.15] tracking-[-0.01em] text-text">
          &ldquo;The response is due on <span className="marker">March 14, 2026</span>.&rdquo;
        </p>
        <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-accent text-label font-semibold text-on-accent">1</span>
          <div className="min-w-0">
            <p className="truncate text-small font-medium text-text">Santos_Motion.pdf</p>
            <p className="text-label text-subtle">Page 3 · Court order, paragraph 2</p>
          </div>
        </div>
        <p className="text-body text-muted">Every answer comes with the exact passage it came from.</p>
      </div>
    </aside>
  )
}
