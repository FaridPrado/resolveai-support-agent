import { Bot, Clock3, MessageSquarePlus, Send, UserRound } from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { EmptyState } from "../../components/states/EmptyState"
import { ConfidenceBadge, PriorityBadge, SentimentBadge } from "../../components/app/TicketBadges"
import { useAuth } from "../../contexts/AuthContext"
import { confidenceLabel, formatDateTime, initials } from "../../lib/utils"
import { showSafeError } from "../../services/workspaceStore"
import { categoryLabel, channelLabels, riskFlagLabel } from "../../lib/labels"
import { canManageWorkspace, canRespondToTickets, permissionText } from "../../lib/permissions"

export function InboxPage() {
  const { data, loadDemoData, member } = useAuth()
  const canRespond = canRespondToTickets(member?.role)
  const canLoadDemo = canManageWorkspace(member?.role)
  const [selectedTicketId, setSelectedTicketId] = useState(data.tickets[0]?.id)
  const selectedTicket = data.tickets.find((ticket) => ticket.id === selectedTicketId) ?? data.tickets[0]
  const selectedCustomer = data.customers.find((customer) => customer.id === selectedTicket?.customer_id)
  const messages = useMemo(
    () => data.ticket_messages.filter((message) => message.ticket_id === selectedTicket?.id),
    [data.ticket_messages, selectedTicket?.id],
  )
  const draft = data.ai_drafts.find((item) => item.ticket_id === selectedTicket?.id)

  if (!data.tickets.length) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar tickets demo"
        description="La bandeja mostrara un flujo de soporte de tres columnas cuando cargues datos demo."
        disabled={!canLoadDemo}
        icon={<MessageSquarePlus className="h-10 w-10" />}
        title={canLoadDemo ? "Aún no hay tickets" : "Tu rol no puede cargar datos demo"}
      />
    )
  }

  return (
    <div className="grid min-h-[calc(100vh-7.5rem)] gap-4 xl:grid-cols-[240px_360px_minmax(0,1fr)]">
      <Card className="h-fit p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Filtros</p>
        <div className="mt-4 space-y-5">
          {[
            ["Estado", ["Nuevo", "Abierto", "Pendiente", "Resuelto"]],
            ["Prioridad", ["Urgente", "Alta", "Media", "Baja"]],
            ["Sentimiento", ["Molesto", "Negativo", "Neutral", "Positivo"]],
            ["Canal", ["Correo", "Chat", "Formulario", "API"]],
            ["Confianza IA", ["Alta confianza", "Requiere revisión", "Baja confianza"]],
          ].map(([label, options]) => (
            <div key={String(label)}>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(options as string[]).map((option) => (
                  <Badge key={option} tone="gray">{option}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-950">Todos los tickets</p>
          <p className="mt-1 text-xs text-slate-500">{data.tickets.length} conversaciones demo activas</p>
        </div>
        <div className="subtle-scrollbar max-h-[calc(100vh-12rem)] overflow-y-auto">
          {data.tickets.map((ticket) => {
            const customer = data.customers.find((item) => item.id === ticket.customer_id)
            const isSelected = ticket.id === selectedTicket?.id
            return (
              <button
                key={ticket.id}
                className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                  isSelected ? "bg-blue-50/70" : "bg-white"
                }`}
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{ticket.subject}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{customer?.name} - {channelLabels[ticket.channel]}</p>
                  </div>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{ticket.ai_summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SentimentBadge sentiment={ticket.sentiment} />
                  <ConfidenceBadge confidence={ticket.ai_confidence} />
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {selectedTicket ? (
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">{selectedTicket.subject}</h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedCustomer?.name} - {selectedCustomer?.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PriorityBadge priority={selectedTicket.priority} />
                  <SentimentBadge sentiment={selectedTicket.sentiment} />
                  <Badge tone="blue">{categoryLabel(selectedTicket.category)}</Badge>
                </div>
              </div>
            </div>

            <div className="subtle-scrollbar max-h-[calc(100vh-21rem)] space-y-4 overflow-y-auto bg-slate-50 p-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg border p-4 ${
                    message.internal_note
                      ? "border-amber-200 bg-amber-50"
                      : message.sender_type === "customer"
                        ? "border-slate-200 bg-white"
                        : "border-blue-100 bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {initials(message.sender_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{message.sender_name}</p>
                        <p className="text-xs text-slate-500">
                          {message.sender_type === "customer"
                            ? "Cliente"
                            : message.sender_type === "agent"
                              ? "Agente"
                              : message.sender_type === "ai"
                                ? "IA"
                                : "Sistema"}
                        </p>
                      </div>
                    </div>
                    {message.internal_note ? <Badge tone="amber">Nota interna</Badge> : null}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.body_plain}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="flex flex-wrap gap-2">
                <Button disabled={!canRespond} title={!canRespond ? permissionText("generar borradores") : undefined} variant="secondary">
                  <Bot className="h-4 w-4" />
                  Generar borrador IA
                </Button>
                <Button disabled={!canRespond} title={!canRespond ? permissionText("agregar notas internas") : undefined} variant="outline">
                  <MessageSquarePlus className="h-4 w-4" />
                  Agregar nota interna
                </Button>
                <Button disabled={!canRespond} title={!canRespond ? permissionText("escalar tickets") : undefined} variant="outline">
                  <UserRound className="h-4 w-4" />
                  Escalar
                </Button>
              </div>
            </div>
          </Card>

          <aside className="space-y-4">
            <Card className="p-5">
              <p className="text-sm font-semibold text-slate-950">Perfil del cliente</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {initials(selectedCustomer?.name ?? "Cliente")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{selectedCustomer?.name}</p>
                  <p className="text-sm text-slate-500">{selectedCustomer?.company}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCustomer?.tags.map((tag) => <Badge key={tag} tone="gray">{tag}</Badge>)}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">Copiloto IA</p>
                <ConfidenceBadge confidence={draft?.confidence ?? selectedTicket.ai_confidence} />
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resumen</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selectedTicket.ai_summary}</p>
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-slate-950">Respuesta sugerida</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {draft?.draft_body ??
                    "Aún no hay borrador generado. En Fase 4 esta acción pasará por la Edge Function generate-ai-draft."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(draft?.risk_flags.length ? draft.risk_flags : ["missing_context"]).map((flag) => (
                    <Badge key={flag} tone={flag.includes("angry") || flag.includes("payment") ? "rose" : "amber"}>
                      {riskFlagLabel(flag)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Acción recomendada</p>
                <p className="text-sm leading-6 text-slate-700">{selectedTicket.ai_recommended_action}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button disabled={!canRespond} size="sm" title={!canRespond ? permissionText("editar borradores") : undefined} variant="outline">Más corta</Button>
                <Button disabled={!canRespond} size="sm" title={!canRespond ? permissionText("editar borradores") : undefined} variant="outline">Más empática</Button>
                <Button disabled={!canRespond} size="sm" title={!canRespond ? permissionText("aprobar envíos simulados") : undefined}>
                  <Send className="h-3.5 w-3.5" />
                  Aprobar envío simulado
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Clock3 className="h-4 w-4 text-slate-500" />
                SLA and confidence
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {confidenceLabel(selectedTicket.ai_confidence)} - vence {formatDateTime(selectedTicket.sla_due_at)}
              </p>
            </Card>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

