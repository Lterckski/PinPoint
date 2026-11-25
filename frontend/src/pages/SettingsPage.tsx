import { Check, LogOut, MonitorSmartphone } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { PasswordField } from '../components/PasswordField'
import { Skeleton } from '../components/States'
import { ThemeToggle } from '../components/ThemeToggle'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { AccountDetails } from '../lib/types'

// Settings: profile, password, sessions, appearance. Account sections hide when sign-in is off.
export function SettingsPage() {
  const { authEnabled } = useAuth()
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-h1 text-text">Settings</h1>
        <p className="text-small text-muted">Your account and how PinPoint looks on this device.</p>
      </header>
      {authEnabled ? <AccountSections /> : (
        <Section title="Account" description="Sign-in is turned off on this server (PINPOINT_AUTH=off), so anyone who can open PinPoint can see every workspace.">
          <p className="text-small text-muted">Turn it on in backend/.env to require an account.</p>
        </Section>
      )}
      <Section title="Appearance" description="Follows your system setting unless you pick one. Remembered on this device.">
        <ThemeToggle showLabels />
      </Section>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-border pt-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 text-text">{title}</h2>
        {description && <p className="text-small text-muted">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

function AccountSections() {
  const [account, setAccount] = useState<AccountDetails | null>(null)
  useEffect(() => {
    let alive = true
    api.account().then((a) => alive && setAccount(a), () => undefined)
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <Section title="Profile" description="Shown in the sidebar.">
        {account ? <ProfileForm account={account} onSaved={(a) => setAccount({ ...account, ...a })} /> : <Skeleton className="h-32" />}
      </Section>
      <Section title="Password" description="Changing it signs you out everywhere else.">
        <PasswordForm />
      </Section>
      <Section title="Sessions" description="Devices and browsers signed in to your account.">
        <SessionsPanel count={account?.sessions} />
      </Section>
    </>
  )
}

function Saved({ show }: { show: boolean }) {
  return (
    <span role="status" className={`inline-flex items-center gap-1.5 text-small text-success transition-opacity ${show ? 'opacity-100' : 'opacity-0'}`}>
      {show && (
        <>
          <Check size={14} strokeWidth={2.25} aria-hidden="true" />
          Saved
        </>
      )}
    </span>
  )
}

function ProfileForm({ account, onSaved }: { account: AccountDetails; onSaved: (a: AccountDetails) => void }) {
  const { setUser } = useAuth()
  const [name, setName] = useState(account.name)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Enter your name.')
    setBusy(true)
    setError(null)
    try {
      const user = await api.updateProfile(name.trim())
      setUser(user)
      onSaved({ ...account, ...user })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={name || account.name} size={44} />
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-text">{account.name}</p>
          <p className="truncate text-small text-muted">{account.role === 'owner' ? 'Owner' : 'Member'}</p>
        </div>
      </div>
      <Field label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} error={error} />
      <Field label="Email" type="email" value={account.email} readOnly disabled hint="Used to sign in. It can't be changed here." />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary" loading={busy} disabled={name.trim() === account.name}>
          Save profile
        </Button>
        <Saved show={saved} />
      </div>
    </form>
  )
}

function PasswordForm() {
  const { apply } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({})
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found: typeof errors = {}
    if (!current) found.current = 'Enter your current password.'
    if (next.length < 10) found.next = 'Use at least 10 characters.'
    else if (next !== confirm) found.confirm = "The passwords don't match."
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      apply(await api.changePassword(current, next))
      setCurrent('')
      setNext('')
      setConfirm('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't change the password."
      setErrors(/current/i.test(message) ? { current: message } : { next: message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* Lets password managers attach the new password to the right account. */}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <PasswordField label="Current password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.current} maxLength={256} />
      <PasswordField label="New password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} hint="At least 10 characters." error={errors.next} maxLength={256} />
      <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} maxLength={256} />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary" loading={busy}>
          Change password
        </Button>
        <Saved show={saved} />
      </div>
    </form>
  )
}

function SessionsPanel({ count }: { count?: number }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const everywhere = async () => {
    setBusy(true)
    try {
      await api.signOutEverywhere()
    } finally {
      await signOut()
      navigate('/signin', { replace: true })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
        <MonitorSmartphone size={20} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-body text-text">
          {count === undefined ? 'Checking…' : `${count} active session${count === 1 ? '' : 's'}, including this one`}
        </p>
      </div>
      {confirming ? (
        <div className="flex flex-col gap-3 rounded-card border border-danger/25 bg-danger-soft p-4">
          <p className="text-small text-text">Sign out on every device, including this one?</p>
          <div className="flex gap-2">
            <Button variant="danger" Icon={LogOut} loading={busy} onClick={() => void everywhere()}>
              Sign out everywhere
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button variant="secondary" Icon={LogOut} onClick={() => setConfirming(true)}>
            Sign out everywhere
          </Button>
        </div>
      )}
    </div>
  )
}
