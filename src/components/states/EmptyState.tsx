import { type ReactNode } from "react"
import { Button } from "../ui/button"

interface EmptyStateProps {
  action?: () => void
  actionLabel?: string
  description: string
  disabled?: boolean
  icon?: ReactNode
  title: string
}

export function EmptyState({ action, actionLabel, description, disabled, icon, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {icon ? <div className="mb-4 text-slate-400">{icon}</div> : null}
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && actionLabel ? (
        <Button className="mt-5" disabled={disabled} onClick={action}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
