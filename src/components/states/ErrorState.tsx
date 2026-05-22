import { AlertTriangle } from "lucide-react"
import { Button } from "../ui/button"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = "No pudimos cargar este espacio de trabajo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" />
        <div>
          <h3 className="text-sm font-semibold">No se pudieron cargar los datos</h3>
          <p className="mt-1 text-sm text-rose-700">{message}</p>
          {onRetry ? (
            <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
