import { useId, type ComponentProps, type ReactNode } from 'react'

type FieldProps = ComponentProps<'input'> & {
  label: string
  /** Help shown under the input until there is an error. */
  hint?: ReactNode
  error?: string | null
  /** Something inside the input's right edge, e.g. a show-password button. */
  trailing?: ReactNode
  /** A link or control on the label's row, e.g. "Forgot password?". */
  labelAside?: ReactNode
}

// Field: visible label above a bordered input, hint or error below, tied together for screen readers.
export function Field({ label, hint, error, trailing, labelAside, className = '', id, ...rest }: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const noteId = `${inputId}-note`
  const note = error || hint
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-label text-text">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          className={`h-10 w-full rounded-control border bg-surface px-3 text-body text-text shadow-subtle transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus:outline-none focus-visible:outline-none focus:ring-3 disabled:opacity-60 ${
            error ? 'border-danger focus:ring-danger/20' : 'border-input focus:border-accent focus:ring-accent/20'
          } ${trailing ? 'pr-11' : ''}`}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {note && (
        <p id={noteId} className={`text-small ${error ? 'text-danger' : 'text-subtle'}`} role={error ? 'alert' : undefined}>
          {note}
        </p>
      )}
    </div>
  )
}
