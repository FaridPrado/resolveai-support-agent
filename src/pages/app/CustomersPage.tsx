import { Users } from "lucide-react"
import { EmptyState } from "../../components/states/EmptyState"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../contexts/AuthContext"
import { canManageWorkspace } from "../../lib/permissions"
import { initials } from "../../lib/utils"
import { showSafeError } from "../../services/workspaceStore"

export function CustomersPage() {
  const { data, loadDemoData, member } = useAuth()
  const canLoadDemo = canManageWorkspace(member?.role)

  if (!data.customers.length) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar clientes demo"
        description="Los clientes están aislados por organización y no se mezclan entre tenants."
        disabled={!canLoadDemo}
        icon={<Users className="h-10 w-10" />}
        title={canLoadDemo ? "Aún no hay clientes" : "Tu rol no puede cargar datos demo"}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Datos mínimos necesarios con historial de tickets y señales de sentimiento.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Empresa</th>
              <th className="px-5 py-3">Tickets</th>
              <th className="px-5 py-3">Último contacto</th>
              <th className="px-5 py-3">Etiquetas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.customers.map((customer) => {
              const tickets = data.tickets.filter((ticket) => ticket.customer_id === customer.id)
              const lastTicket = [...tickets].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at))[0]
              return (
                <tr key={customer.id} className="bg-white hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {initials(customer.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{customer.company}</td>
                  <td className="px-5 py-4 text-slate-700">{tickets.length}</td>
                  <td className="px-5 py-4 text-slate-700">{lastTicket ? new Date(lastTicket.last_message_at).toLocaleDateString("es-CO") : "Sin contacto"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => <Badge key={tag} tone="gray">{tag}</Badge>)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

