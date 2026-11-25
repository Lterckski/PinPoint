import { AlertTriangle, RotateCw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode; resetKey?: string }
type State = { error: Error | null; resetKey?: string }

// Catches a crash in one screen so the rest of the app (sidebar, navigation) keeps working.
// resetKey (the route) clears the error when the user goes somewhere else.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PinPoint screen crashed', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-card bg-danger-soft text-danger">
          <AlertTriangle size={22} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-h2 text-text">This screen hit a problem</h1>
          <p className="text-body text-muted">Your files and answers are safe. Reload to try again.</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-9 items-center gap-2 rounded-control bg-accent px-3.5 text-body font-medium text-on-accent hover:bg-accent-hover"
        >
          <RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />
          Reload
        </button>
      </div>
    )
  }
}
