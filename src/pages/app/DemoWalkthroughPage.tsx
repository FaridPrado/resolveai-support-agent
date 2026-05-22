import {
  AlertTriangle,
  BarChart3,
  Bot,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  FileText,
  History,
  Lightbulb,
  Send,
  ShieldAlert,
  TimerReset,
  UserCheck,
  type LucideIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { NavLink } from "react-router-dom"
import { toast } from "sonner"
import { ConfidenceBadge, PriorityBadge, SentimentBadge } from "../../components/app/TicketBadges"
import { EmptyState } from "../../components/states/EmptyState"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../contexts/AuthContext"
import { computeMetrics } from "../../lib/analytics"
import { categoryLabel, channelLabels, riskFlagLabel, ticketStatusLabels } from "../../lib/labels"
import { canManageWorkspace, canRespondToTickets, permissionText } from "../../lib/permissions"
import { cn, formatCurrency, formatDateTime, formatPercent, initials } from "../../lib/utils"
import { showSafeError } from "../../services/workspaceStore"

interface WalkthroughStep {
  description: string
  icon: LucideIcon
  title: string
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    description: "Un caso sensible entra por correo con cliente molesto y SLA cercano.",
    icon: AlertTriangle,
    title: "Ticket urgente",
  },
  {
    description: "La IA detecta categoría, prioridad, sentimiento, idioma y riesgo operativo.",
    icon: ClipboardCheck,
    title: "Clasificación automática",
  },
  {
    description: "El equipo entiende el problema sin leer toda la conversación.",
    icon: Bot,
    title: "Resumen IA",
  },
  {
    description: "El borrador usa fuentes verificadas de la base de conocimiento.",
    icon: FileText,
    title: "Respuesta con fuentes",
  },
  {
    description: "Las banderas evitan promesas riesgosas o decisiones sin contexto.",
    icon: ShieldAlert,
    title: "Banderas de riesgo",
  },
  {
    description: "El agente ajusta tono, precisión y datos solicitados antes de aprobar.",
    icon: Edit3,
    title: "Edicion humana",
  },
  {
    description: "La demo simula el envío y mantiene aprobación humana obligatoria.",
    icon: Send,
    title: "Envío simulado",
  },
  {
    description: "Cada acción queda registrada para seguridad y cumplimiento.",
    icon: History,
    title: "Registro de auditoría",
  },
  {
    description: "El impacto se traduce en minutos ahorrados y menos retrabajo.",
    icon: BarChart3,
    title: "Impacto en analítica",
  },
  {
    description: "El sistema convierte temas recurrentes en oportunidades de conocimiento.",
    icon: Lightbulb,
    title: "Artículo sugerido",
  },
]

function riskTone(flag: string) {
  if (flag.includes("angry") || flag.includes("payment") || flag.includes("refund")) return "rose" as const
  if (flag.includes("security") || flag.includes("prompt")) return "amber" as const
  return "blue" as const
}

function sourceMatches(title: string) {
  const normalized = title.toLowerCase()
  return (
    normalized.includes("reembolso") ||
    normalized.includes("facturación") ||
    normalized.includes("escalamiento")
  )
}

export function DemoWalkthroughPage() {
  const { data, loadDemoData, member, organization, user } = useAuth()
  const [activeStep, setActiveStep] = useState(0)
  const [humanReplies, setHumanReplies] = useState<Record<string, string>>({})
  const [sentTicketIds, setSentTicketIds] = useState<Record<string, boolean>>({})
  const canLoadDemo = canManageWorkspace(member?.role)
  const canRespond = canRespondToTickets(member?.role)

  const targetTicket = useMemo(
    () =>
      data.tickets.find((ticket) => ticket.intent === "duplicate_charge") ??
      data.tickets.find((ticket) => ticket.priority === "urgent" && ticket.sentiment === "angry") ??
      data.tickets[0],
    [data.tickets],
  )

  const customer = data.customers.find((item) => item.id === targetTicket?.customer_id)
  const messages = data.ticket_messages.filter((message) => message.ticket_id === targetTicket?.id)
  const customerMessage = messages.find((message) => message.sender_type === "customer")
  const draft = data.ai_drafts.find((item) => item.ticket_id === targetTicket?.id)
  const metrics = computeMetrics(data, organization?.hourly_cost ?? 25)
  const billingTicketCount = data.tickets.filter((ticket) => ticket.category === "Billing").length

  const demoSources = useMemo(() => {
    const fromKnowledge = data.knowledge_sources.filter((source) => sourceMatches(source.title)).slice(0, 3)
    const fromDraft =
      draft?.cited_sources.map((source) => ({
        content: source.excerpt,
        id: source.source_id,
        title: source.title,
      })) ?? []
    const merged = [...fromDraft, ...fromKnowledge]
    return merged.filter((source, index, all) => all.findIndex((item) => item.title === source.title) === index).slice(0, 3)
  }, [data.knowledge_sources, draft?.cited_sources])

  const recommendedHumanReply = draft?.draft_body
    ? `${draft.draft_body}

Para avanzar con seguridad, por favor comparte el número de factura si lo tienes y la fecha del cargo duplicado. No confirmaremos ningún reembolso hasta que Facturación valide la transacción.`
    : ""

  if (!data.tickets.length || !targetTicket) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar datos demo"
        description="El recorrido necesita tickets, mensajes, borradores IA, artículos de conocimiento, auditoría y eventos de analítica."
        disabled={!canLoadDemo}
        icon={<ClipboardCheck className="h-10 w-10" />}
        title={canLoadDemo ? "Prepara la demo comercial" : "Tu rol no puede cargar datos demo"}
      />
    )
  }

  const originalDraft = draft?.draft_body ?? "Genera un borrador IA para ver la respuesta sugerida."
  const humanReply = targetTicket ? (humanReplies[targetTicket.id] ?? recommendedHumanReply) : recommendedHumanReply
  const simulatedSent = targetTicket ? Boolean(sentTicketIds[targetTicket.id]) : false
  const hasHumanEdits = humanReply.trim() !== originalDraft.trim()
  const riskFlags = draft?.risk_flags.length ? draft.risk_flags : ["missing_context"]
  const caseSavedMinutes = 5
  const projectedSavings = ((metrics.estimatedTimeSavedMinutes + caseSavedMinutes) / 60) * (organization?.hourly_cost ?? 25)
  const generatedAuditDetails = [
    ["Confianza", formatPercent(draft?.confidence ?? targetTicket.ai_confidence ?? 0)],
    ["Edición humana", hasHumanEdits ? "Sí" : "No"],
    ["Riesgos", riskFlags.map(riskFlagLabel).join(", ")],
    ["Tipo", "Envío simulado"],
  ]

  const handleSimulatedSend = () => {
    if (!canRespond) {
      toast.error("Acción no permitida", {
        description: permissionText("aprobar envíos simulados"),
      })
      return
    }
    setSentTicketIds((current) => ({ ...current, [targetTicket.id]: true }))
    setActiveStep(7)
    toast.success("Envío simulado aprobado", {
      description: "La demo generó un evento de auditoría y actualizó el impacto esperado.",
    })
  }

  const goNext = () => setActiveStep((step) => Math.min(step + 1, walkthroughSteps.length - 1))
  const goBack = () => setActiveStep((step) => Math.max(step - 1, 0))
  const ActiveIcon = walkthroughSteps[activeStep].icon

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="slate">Demo guiada</Badge>
              <Badge tone="emerald">5 minutos</Badge>
              <Badge tone="blue">Humano en control</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Recorrido comercial: de ticket crítico a aprendizaje operativo
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Muestra cómo ResolveAI clasifica, propone una respuesta segura, exige control humano,
              registra auditoría y convierte un caso repetitivo en una mejora de base de conocimiento.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <div className="rounded-lg bg-rose-50 p-4 text-rose-800 ring-1 ring-inset ring-rose-100">
              <p className="text-xs font-semibold uppercase tracking-wide">Riesgo inicial</p>
              <p className="mt-2 text-xl font-semibold">Urgente</p>
              <p className="mt-1 text-xs leading-5">Cliente molesto + pago sensible</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-blue-800 ring-1 ring-inset ring-blue-100">
              <p className="text-xs font-semibold uppercase tracking-wide">Tiempo ahorrado</p>
              <p className="mt-2 text-xl font-semibold">{caseSavedMinutes} min</p>
              <p className="mt-1 text-xs leading-5">Clasificación + borrador</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800 ring-1 ring-inset ring-emerald-100">
              <p className="text-xs font-semibold uppercase tracking-wide">Control</p>
              <p className="mt-2 text-xl font-semibold">100%</p>
              <p className="mt-1 text-xs leading-5">Aprobación humana requerida</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Guion de la demo</CardTitle>
              <CardDescription>Paso {activeStep + 1} de {walkthroughSteps.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {walkthroughSteps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index === activeStep
                const isComplete = index < activeStep || (index === 7 && simulatedSent)
                return (
                  <button
                    key={step.title}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md p-3 text-left transition",
                      isActive
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    )}
                    onClick={() => setActiveStep(index)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        isActive ? "bg-white/15 text-white" : isComplete ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{step.title}</span>
                      <span className={cn("mt-1 block text-xs leading-5", isActive ? "text-slate-300" : "text-slate-500")}>
                        {step.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultado que se vende</CardTitle>
              <CardDescription>Lo que el cliente entiende rápido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Menos lectura manual para priorizar tickets.",
                "Menos errores porque la IA cita políticas.",
                "Menos riesgo porque el humano aprueba antes de enviar.",
                "Más aprendizaje porque cada caso alimenta auditoría y conocimiento.",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <ActiveIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{walkthroughSteps[activeStep].title}</CardTitle>
                    <CardDescription>{walkthroughSteps[activeStep].description}</CardDescription>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={activeStep === 0} size="sm" variant="outline" onClick={goBack}>
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button disabled={activeStep === walkthroughSteps.length - 1} size="sm" onClick={goNext}>
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeStep === 0 ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Ticket entrante</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{targetTicket.subject}</h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {customer?.name} - {customer?.email} - {channelLabels[targetTicket.channel]}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <PriorityBadge priority={targetTicket.priority} />
                        <SentimentBadge sentiment={targetTicket.sentiment} />
                      </div>
                    </div>
                    <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mensaje del cliente</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{customerMessage?.body_plain}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {initials(customer?.name ?? "Cliente")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{customer?.name}</p>
                        <p className="text-xs text-slate-500">{customer?.company}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {customer?.tags.map((tag) => <Badge key={tag} tone="gray">{tag}</Badge>)}
                    </div>
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Estado</span>
                        <span className="font-semibold text-slate-950">{ticketStatusLabels[targetTicket.status]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">SLA</span>
                        <span className="font-semibold text-rose-700">{formatDateTime(targetTicket.sla_due_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 1 ? (
                <div className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SignalCard label="Categoría" value={categoryLabel(targetTicket.category)} tone="blue" />
                    <SignalCard label="Prioridad" value="Urgente" tone="rose" />
                    <SignalCard label="Sentimiento" value="Molesto" tone="amber" />
                    <SignalCard label="Idioma" value={targetTicket.language === "es" ? "Español" : "Inglés"} tone="slate" />
                  </div>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Clasificación guardada en el ticket</p>
                        <p className="mt-1 text-sm text-slate-500">
                          La automatización separa urgencia real de ruido y deja el caso listo para acción humana.
                        </p>
                      </div>
                      <ConfidenceBadge confidence={targetTicket.ai_confidence} />
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <MiniFinding icon={TimerReset} title="SLA cercano" description="Debe resolverse antes de prometer compensaciones." />
                      <MiniFinding icon={UserCheck} title="Asignación recomendada" description="Equipo de Facturación con aprobación de admin." />
                      <MiniFinding icon={ShieldAlert} title="Política sensible" description="No confirmar reembolso sin evidencia." />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 2 ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-lg bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resumen IA</p>
                    <p className="mt-3 text-lg leading-8 text-slate-800">{targetTicket.ai_summary}</p>
                    <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-900">Acción recomendada</p>
                      <p className="mt-2 text-sm leading-6 text-blue-800">{targetTicket.ai_recommended_action}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Bot className="h-4 w-4 text-blue-600" />
                      No es caja negra
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      El resumen es visible para acelerar lectura, pero no reemplaza decision humana. Las fuentes,
                      confianza y riesgos se muestran antes de aprobar cualquier respuesta.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge tone="emerald">Rápido de leer</Badge>
                      <Badge tone="blue">Trazable</Badge>
                      <Badge tone="amber">Requiere revisión</Badge>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 3 ? (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="rounded-lg border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Respuesta sugerida</p>
                        <p className="mt-1 text-sm text-slate-500">Borrador listo para revisión, no para envío automático.</p>
                      </div>
                      <ConfidenceBadge confidence={draft?.confidence ?? targetTicket.ai_confidence} />
                    </div>
                    <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {originalDraft}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">Fuentes citadas</p>
                      <Badge tone="blue">Basado en {demoSources.length} fuentes</Badge>
                    </div>
                    <div className="mt-4 space-y-3">
                      {demoSources.map((source) => (
                        <div key={source.id} className="rounded-md border border-slate-200 p-3">
                          <p className="text-sm font-semibold text-slate-950">{source.title}</p>
                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">{source.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 4 ? (
                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <ShieldAlert className="h-4 w-4" />
                      Riesgos detectados
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {riskFlags.map((flag) => (
                        <Badge key={flag} tone={riskTone(flag)}>{riskFlagLabel(flag)}</Badge>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-amber-900">
                      La IA puede reconocer el problema y pedir datos, pero no debe prometer reembolsos,
                      descuentos o compensaciones sin evidencia y aprobación.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-950">Controles activados</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <MiniFinding icon={ShieldAlert} title="Sin auto-envío" description="El botón de envío requiere permiso de agente." />
                      <MiniFinding icon={FileText} title="Citas visibles" description="Las fuentes aparecen antes de aprobar." />
                      <MiniFinding icon={History} title="Auditoría" description="La acción queda registrada para revisión posterior." />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 5 ? (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div>
                    <label className="text-sm font-semibold text-slate-950" htmlFor="human-reply">
                      Edicion del agente humano
                    </label>
                    <textarea
                      className="mt-3 min-h-72 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      id="human-reply"
                      value={humanReply}
                      onChange={(event) =>
                        setHumanReplies((current) => ({ ...current, [targetTicket.id]: event.target.value }))
                      }
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={hasHumanEdits ? "emerald" : "gray"}>
                        {hasHumanEdits ? "Cambios humanos detectados" : "Sin cambios humanos"}
                      </Badge>
                      <Badge tone="amber">Revisión requerida</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Antes</p>
                      <p className="mt-2 line-clamp-6 text-sm leading-6 text-slate-600">{originalDraft}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Despues</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-900">
                        Se agrego solicitud de evidencia y se mantiene la restriccion de no prometer reembolso.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 6 ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-lg border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-950">Vista previa del envío simulado</p>
                    <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {humanReply}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                      <Send className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-950">Aprobación humana obligatoria</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      En esta versión no se envían emails reales. La acción crea un mensaje simulado y un evento de auditoría para demostrar el flujo seguro.
                    </p>
                    <Button
                      className="mt-5 w-full"
                      disabled={!canRespond || simulatedSent}
                      title={!canRespond ? permissionText("aprobar envíos simulados") : undefined}
                      onClick={handleSimulatedSend}
                    >
                      <Send className="h-4 w-4" />
                      {simulatedSent ? "Envío simulado aprobado" : "Aprobar envío simulado"}
                    </Button>
                  </div>
                </div>
              ) : null}

              {activeStep === 7 ? (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="rounded-lg border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Evento de auditoría generado</p>
                        <p className="mt-1 text-sm text-slate-500">Registro claro para seguridad, calidad y cumplimiento.</p>
                      </div>
                      <Badge tone={simulatedSent ? "emerald" : "amber"}>
                        {simulatedSent ? "Generado en la demo" : "Esperando envío simulado"}
                      </Badge>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                      <div className="grid grid-cols-[150px_minmax(0,1fr)] border-b border-slate-100 text-sm">
                        <span className="bg-slate-50 px-4 py-3 font-medium text-slate-500">Acción</span>
                        <span className="px-4 py-3 text-slate-800">envío simulado registrado</span>
                      </div>
                      <div className="grid grid-cols-[150px_minmax(0,1fr)] border-b border-slate-100 text-sm">
                        <span className="bg-slate-50 px-4 py-3 font-medium text-slate-500">Actor</span>
                        <span className="px-4 py-3 text-slate-800">{user?.name ?? "Agente demo"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_minmax(0,1fr)] border-b border-slate-100 text-sm">
                        <span className="bg-slate-50 px-4 py-3 font-medium text-slate-500">Entidad</span>
                        <span className="truncate px-4 py-3 text-slate-800">{targetTicket.id}</span>
                      </div>
                      <div className="grid grid-cols-[150px_minmax(0,1fr)] text-sm">
                        <span className="bg-slate-50 px-4 py-3 font-medium text-slate-500">Detalle</span>
                        <span className="space-y-1 px-4 py-3 text-sm text-slate-700">
                          {generatedAuditDetails.map(([label, value]) => (
                            <span key={label} className="block">
                              <span className="font-medium text-slate-950">{label}:</span> {value}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-950">Auditoría existente</p>
                    <div className="mt-4 space-y-3">
                      {data.audit_logs.slice(0, 3).map((log) => (
                        <div key={log.id} className="rounded-md bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-950">{log.action}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDateTime(log.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 8 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <ImpactCard
                    description="4 min por borrador + 1 min por clasificación."
                    icon={TimerReset}
                    label="Ahorro del caso"
                    tone="blue"
                    value={`${caseSavedMinutes} min`}
                  />
                  <ImpactCard
                    description="Con el caso aprobado dentro del recorrido."
                    icon={Bot}
                    label="Borradores IA"
                    tone="emerald"
                    value={String(metrics.aiDraftsGenerated + (simulatedSent ? 1 : 0))}
                  />
                  <ImpactCard
                    description="Basado en el costo de soporte configurado."
                    icon={BarChart3}
                    label="Ahorro proyectado"
                    tone="slate"
                    value={formatCurrency(projectedSavings)}
                  />
                  <ImpactCard
                    description="Promesas no autorizadas bloqueadas por riesgo."
                    icon={ShieldAlert}
                    label="Riesgo reducido"
                    tone="amber"
                    value="Alto"
                  />
                  <div className="rounded-lg border border-slate-200 bg-white p-5 md:col-span-2 xl:col-span-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Impacto acumulado del espacio</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Los ahorros son ilustrativos y se calculan desde actividad real o demo.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="blue">{metrics.ticketsTriaged} tickets clasificados</Badge>
                        <Badge tone="emerald">{metrics.aiDraftsGenerated} borradores generados</Badge>
                        <Badge tone="amber">{formatPercent(metrics.averageConfidence)} confianza promedio</Badge>
                      </div>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, Math.max(12, metrics.estimatedTimeSavedMinutes * 3))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 9 ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-950">Nuevo artículo sugerido</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-blue-950">
                          Como validar cobros duplicados antes de prometer reembolsos
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-blue-900">
                          La demo detecta {billingTicketCount} tickets de facturación y riesgo de pago. La recomendación es convertir el aprendizaje del caso en un artículo corto con datos requeridos, reglas de aprobación y ruta de escalamiento.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <MiniFinding icon={BookOpen} title="Contenido faltante" description="Datos mínimos para validar cargo duplicado." />
                      <MiniFinding icon={ShieldAlert} title="Política segura" description="No prometer reembolso antes de revisión." />
                      <MiniFinding icon={UserCheck} title="Owner claro" description="Facturación debe mantener el artículo." />
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-950">Cierre del relato comercial</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      En menos de cinco minutos el cliente ve ahorro de tiempo, reduccion de errores,
                      trazabilidad y control humano. La base de conocimiento mejora con cada patron recurrente.
                    </p>
                    <Button asChild className="mt-5 w-full" variant="outline">
                      <NavLink to="/knowledge">
                        <BookOpen className="h-4 w-4" />
                        Revisar base de conocimiento
                      </NavLink>
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function SignalCard({
  label,
  tone,
  value,
}: {
  label: string
  tone: "amber" | "blue" | "rose" | "slate"
  value: string
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
    blue: "bg-blue-50 text-blue-800 ring-blue-100",
    rose: "bg-rose-50 text-rose-800 ring-rose-100",
    slate: "bg-slate-50 text-slate-800 ring-slate-200",
  }
  return (
    <div className={cn("rounded-lg p-4 ring-1 ring-inset", tones[tone])}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}

function MiniFinding({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}

function ImpactCard({
  description,
  icon: Icon,
  label,
  tone,
  value,
}: {
  description: string
  icon: LucideIcon
  label: string
  tone: "amber" | "blue" | "emerald" | "slate"
  value: string
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p>
    </Card>
  )
}

