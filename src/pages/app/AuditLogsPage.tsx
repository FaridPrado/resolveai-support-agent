import { ClipboardList } from "lucide-react"
import { EmptyState } from "../../components/states/EmptyState"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { useAuth } from "../../contexts/AuthContext"
import { auditActionLabel, entityLabel } from "../../lib/labels"
import { canManageWorkspace } from "../../lib/permissions"
import { showSafeError } from "../../services/workspaceStore"

export function AuditLogsPage() {
  const { data, loadDemoData, member } = useAuth()
  const canLoadDemo = canManageWorkspace(member?.role)

  if (!data.audit_logs.length) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar auditoría demo"
        description="La auditoría registra creación de tickets, clasificación, borradores IA, ingesta, automatizaciones y eventos de seguridad."
        disabled={!canLoadDemo}
        icon={<ClipboardList className="h-10 w-10" />}
        title={canLoadDemo ? "Aún no hay registros de auditoría" : "Tu rol no puede cargar datos demo"}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Filtrar por acción" />
          <Input placeholder="Actor" />
          <Input placeholder="Tipo de entidad" />
          <Input type="date" />
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Registros de auditoría</CardTitle>
          <CardDescription>Trazabilidad operacional append-only para soporte e IA.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Acción</th>
                <th className="px-5 py-3">Entidad</th>
                <th className="px-5 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.audit_logs.map((log) => (
                <tr key={log.id} className="bg-white hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-600">{new Date(log.created_at).toLocaleString("es-CO")}</td>
                  <td className="px-5 py-4"><Badge tone={log.actor_type === "ai" ? "blue" : "gray"}>{log.actor_type}</Badge></td>
                  <td className="px-5 py-4 font-medium text-slate-950">{auditActionLabel(log.action)}</td>
                  <td className="px-5 py-4 text-slate-600">{entityLabel(log.entity_type)}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{JSON.stringify(log.metadata).slice(0, 120)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

