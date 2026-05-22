import { Download, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"
import { StatCard } from "../../components/app/StatCard"
import { EmptyState } from "../../components/states/EmptyState"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../contexts/AuthContext"
import { computeMetrics, ticketCategoryChart, topRecurringIssues, volumeChart } from "../../lib/analytics"
import { canManageWorkspace } from "../../lib/permissions"
import { formatCurrency, formatPercent } from "../../lib/utils"
import { showSafeError } from "../../services/workspaceStore"

export function AnalyticsPage() {
  const { data, loadDemoData, member, organization } = useAuth()
  const metrics = computeMetrics(data, organization?.hourly_cost ?? 25)
  const canLoadDemo = canManageWorkspace(member?.role)

  if (!data.tickets.length) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar analítica demo"
        description="La analítica se genera desde tickets demo, eventos de borrador, clasificaciones y conocimiento."
        disabled={!canLoadDemo}
        icon={<TrendingUp className="h-10 w-10" />}
        title={canLoadDemo ? "Aún no hay analítica" : "Tu rol no puede cargar datos demo"}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Rendimiento de soporte</h2>
          <p className="mt-1 text-sm text-slate-500">Métricas reales del modelo de datos del espacio actual.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.success("Exportación preparada", { description: "El hook CSV queda listo para Fase 5." })}
        >
          <Download className="h-4 w-4" />
          Exportar reporte
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Aceptación IA" tone="emerald" value="71%" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Confianza promedio" tone="blue" value={formatPercent(metrics.averageConfidence)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Tiempo respuesta sim." tone="amber" value="14m" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Ahorro mensual" tone="slate" value={formatCurrency(metrics.monthlySavingsEstimate)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volumen de tickets</CardTitle>
            <CardDescription>Tickets y borradores de la última semana.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeChart(data)}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line dataKey="tickets" stroke="#2563eb" strokeWidth={2} />
                  <Line dataKey="drafts" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tendencia por categoría</CardTitle>
            <CardDescription>Principales temas detectados por clasificación automática.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketCategoryChart(data)}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Temas recurrentes</CardTitle>
          <CardDescription>Úsalo para priorizar brechas de conocimiento y reglas de automatización.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {topRecurringIssues(data).map((issue) => (
            <div key={issue.category} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-950">{issue.category}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{issue.count}</p>
              <p className="mt-1 text-sm text-slate-500">tickets detectados</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

