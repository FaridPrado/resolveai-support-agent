import { Plus, Workflow } from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "../../components/states/EmptyState"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../contexts/AuthContext"
import { canManageAutomations, permissionText } from "../../lib/permissions"
import { showSafeError } from "../../services/workspaceStore"

export function AutomationsPage() {
  const { data, loadDemoData, member } = useAuth()
  const canManage = canManageAutomations(member?.role)

  if (!data.automation_rules.length) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar automatizaciones demo"
        description="Las reglas demo muestran escalamiento urgente, revisión por baja confianza y protección ante prompt injection."
        disabled={!canManage}
        icon={<Workflow className="h-10 w-10" />}
        title={canManage ? "Aún no hay reglas" : "Tu rol no puede administrar reglas"}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Reglas de automatización</h2>
          <p className="mt-1 text-sm text-slate-500">Base visual para flujos seguros y conscientes del rol.</p>
        </div>
        <Button
          disabled={!canManage}
          title={!canManage ? permissionText("crear reglas") : undefined}
          onClick={() => toast.info("Constructor preparado", { description: "El CRUD real queda detrás de Supabase y permisos de Edge Functions." })}
        >
          <Plus className="h-4 w-4" />
          Crear regla
        </Button>
      </div>

      <section className="grid gap-4">
        {data.automation_rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{rule.name}</CardTitle>
                <CardDescription>{rule.description}</CardDescription>
              </div>
              <Badge tone={rule.enabled ? "emerald" : "gray"}>{rule.enabled ? "Activa" : "Inactiva"}</Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Disparador</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{rule.trigger_type}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Condiciones</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{JSON.stringify(rule.conditions, null, 2)}</pre>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Acciones</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{JSON.stringify(rule.actions, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

