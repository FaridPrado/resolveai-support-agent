import {
  AlertTriangle,
  BarChart3,
  Bot,
  DatabaseZap,
  Inbox,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  TimerReset,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { EmptyState } from "../../components/states/EmptyState"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { StatCard } from "../../components/app/StatCard"
import { ConfidenceBadge, PriorityBadge, SentimentBadge } from "../../components/app/TicketBadges"
import { useAuth } from "../../contexts/AuthContext"
import {
  computeMetrics,
  sentimentChart,
  ticketCategoryChart,
  todaysPriorities,
  topRecurringIssues,
  volumeChart,
} from "../../lib/analytics"
import { categoryLabel, sentimentLabels } from "../../lib/labels"
import { canManageWorkspace } from "../../lib/permissions"
import { formatCurrency, formatPercent } from "../../lib/utils"
import { showSafeError } from "../../services/workspaceStore"

const chartColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#06b6d4"]

export function DashboardPage() {
  const { data, loadDemoData, member, organization } = useAuth()
  const metrics = computeMetrics(data, organization?.hourly_cost ?? 25)
  const hasData = data.tickets.length > 0
  const canLoadDemo = canManageWorkspace(member?.role)

  if (!hasData) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar datos demo"
        description="Crea datos realistas de soporte con clientes, tickets, borradores de IA, artículos, analítica, automatizaciones y auditoría."
        disabled={!canLoadDemo}
        icon={<DatabaseZap className="h-10 w-10" />}
        title={canLoadDemo ? "Tu espacio de soporte está listo para datos" : "Tu rol no puede cargar datos demo"}
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Tickets nuevos, abiertos y pendientes."
          icon={<Inbox className="h-5 w-5" />}
          label="Tickets abiertos"
          tone="blue"
          value={String(metrics.openTickets)}
        />
        <StatCard
          description="Requieren atención humana rápida."
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Tickets urgentes"
          tone="rose"
          value={String(metrics.urgentTickets)}
        />
        <StatCard
          description="Siempre requieren aprobación humana."
          icon={<Bot className="h-5 w-5" />}
          label="Borradores IA"
          tone="emerald"
          value={String(metrics.aiDraftsGenerated)}
        />
        <StatCard
          description="Borrador: 4 min. Clasificación: 1 min."
          icon={<TimerReset className="h-5 w-5" />}
          label="Tiempo ahorrado"
          tone="amber"
          value={`${Math.round(metrics.estimatedTimeSavedMinutes)}m`}
        />
        <StatCard
          description="En tickets clasificados automáticamente."
          icon={<BarChart3 className="h-5 w-5" />}
          label="Confianza prom."
          tone="slate"
          value={formatPercent(metrics.averageConfidence)}
        />
        <StatCard
          description="Oportunidades por temas recurrentes."
          icon={<Lightbulb className="h-5 w-5" />}
          label="Brechas de conocimiento"
          tone="amber"
          value={String(metrics.knowledgeGaps)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Volumen de tickets</CardTitle>
              <CardDescription>Tickets creados y borradores generados por día.</CardDescription>
            </div>
            <Badge tone="blue">Últimos 7 días</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChart(data)}>
                  <defs>
                    <linearGradient id="tickets" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="drafts" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis axisLine={false} dataKey="date" tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area dataKey="tickets" fill="url(#tickets)" name="Tickets" stroke="#2563eb" strokeWidth={2} />
                  <Area dataKey="drafts" fill="url(#drafts)" name="Borradores" stroke="#10b981" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto ROI</CardTitle>
            <CardDescription>Los ahorros son ilustrativos y usan el costo de soporte configurado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Ahorro mensual potencial</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {formatCurrency(metrics.monthlySavingsEstimate)}
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-300">
                Basado en {metrics.aiDraftsGenerated} borradores, {metrics.ticketsTriaged} tickets clasificados y{" "}
                {formatCurrency(organization?.hourly_cost ?? 25)}/hora de costo de soporte.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-950">{metrics.ticketsTriaged}</p>
                <p className="mt-1 text-slate-500">Tickets clasificados</p>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-950">{metrics.repetitiveIssues}</p>
                <p className="mt-1 text-slate-500">Temas repetitivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tickets por categoría</CardTitle>
            <CardDescription>Distribución clasificada automáticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketCategoryChart(data)}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {ticketCategoryChart(data).map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topRecurringIssues(data).map((item, index) => (
                <Badge key={item.category} tone={index === 0 ? "blue" : "gray"}>
                  {item.category}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribucion de sentimiento</CardTitle>
            <CardDescription>Estado de ánimo del cliente en tickets activos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentChart(data)} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={4}>
                    {sentimentChart(data).map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sentimentChart(data).map((item) => (
                <Badge key={item.name} tone={item.name === "angry" ? "rose" : item.name === "positive" ? "emerald" : "gray"}>
                  {sentimentLabels[item.name as keyof typeof sentimentLabels] ?? item.name}: {item.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones de IA</CardTitle>
            <CardDescription>Generadas desde tickets recurrentes y banderas de riesgo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Crear un artículo sobre verificación de cobros duplicados antes de reembolsos.",
              "Los tickets de facturación aumentaron en la cola urgente; agrega aprobación humana.",
              "Se detectó prompt injection. Mantener envío automático desactivado y escalar seguridad.",
            ].map((recommendation, index) => (
              <div key={recommendation} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  {index === 2 ? <ShieldCheck className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                </div>
                <p className="text-sm leading-6 text-slate-700">{recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.68fr_0.32fr]">
        <Card>
          <CardHeader>
            <CardTitle>Prioridades de hoy</CardTitle>
            <CardDescription>La urgencia combina prioridad, sentimiento, confianza y riesgo SLA.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {todaysPriorities(data).map((ticket) => {
              const customer = data.customers.find((item) => item.id === ticket.customer_id)
              return (
                <div key={ticket.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{ticket.subject}</p>
                    <p className="mt-1 text-sm text-slate-500">{customer?.name} - {categoryLabel(ticket.category)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PriorityBadge priority={ticket.priority} />
                    <SentimentBadge sentiment={ticket.sentiment} />
                    <ConfidenceBadge confidence={ticket.ai_confidence} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modelo operativo</CardTitle>
            <CardDescription>Postura de seguridad Fase 1/2.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { description: "Los borradores de IA nunca se envían solos en este MVP.", icon: TimerReset, title: "Aprobación humana requerida" },
              { description: "El esquema incluye eventos de auditoría solo anexados.", icon: ListChecks, title: "Auditoría habilitada" },
              { description: "Las claves API solo las leen Edge Functions.", icon: ShieldCheck, title: "Secretos del lado servidor" },
              { description: "Cada tabla principal incluye ID de organización y RLS.", icon: DatabaseZap, title: "Aislamiento multi-tenant" },
            ].map(({ description, icon: Icon, title }) => (
              <div key={title} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                <Icon className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

