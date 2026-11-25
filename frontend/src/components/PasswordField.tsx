import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { Field } from './Field'
import { IconButton } from './IconButton'

type PasswordFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
  hint?: ReactNode
  error?: string | null
  labelAside?: ReactNode
}

// Password input with show/hide. Paste and password managers always work (no blocking handlers).
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <Field
      {...props}
      type={visible ? 'text' : 'password'}
      spellCheck={false}
      autoCapitalize="none"
      trailing={
        <IconButton
          Icon={visible ? EyeOff : Eye}
          label={visible ? 'Hide password' : 'Show password'}
          size="sm"
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        />
      }
    />
  )
}
