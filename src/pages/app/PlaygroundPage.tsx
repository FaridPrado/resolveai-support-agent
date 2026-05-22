import { Bot, FlaskConical, ShieldAlert } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "../../components/states/EmptyState"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input, Label, Select } from "../../components/ui/input"
import { useAuth } from "../../contexts/AuthContext"
import { riskFlagLabel } from "../../lib/labels"
import { canManageWorkspace } from "../../lib/permissions"
import { confidenceLabel } from "../../lib/utils"
import { showSafeError } from "../../services/workspaceStore"

export function PlaygroundPage() {
  const { data, loadDemoData, member } = useAuth()
  const [ticketId, setTicketId] = useState(data.tickets[0]?.id ?? "")
  const [tone, setTone] = useState("professional")
  const [instructions, setInstructions] = useState("Mantenerlo claro y evitar prometer reembolsos.")
  const selectedTicket = data.tickets.find((ticket) => ticket.id === ticketId) ?? data.tickets[0]
  const draft = data.ai_drafts.find((item) => item.ticket_id === selectedTicket?.id)
  const sources = useMemo(() => draft?.cited_sources ?? data.knowledge_sources.slice(0, 2).map((source) => ({
    excerpt: source.content.slice(0, 140),
    source_id: source.id,
    title: source.title,
  })), [data.knowledge_sources, draft])
  const canLoadDemo = canManageWorkspace(member?.role)

  if (!data.tickets.length) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar tickets demo"
        description="Necesitas tickets y conocimiento para probar respuestas de IA sin conectar canales reales."
        disabled={!canLoadDemo}
        icon={<FlaskConical className="h-10 w-10" />}
        title={canLoadDemo ? "No hay tickets para probar" : "Tu rol no puede cargar datos demo"}
      />
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Pruebas de IA</CardTitle>
          <CardDescription>Prueba el agente sin conectar Zendesk, Intercom o Gmail.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ticket">Ticket demo</Label>
            <Select id="ticket" value={ticketId} onChange={(event) => setTicketId(event.target.value)}>
              {data.tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>{ticket.subject}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">Tono</Label>
            <Select id="tone" value={tone} onChange={(event) => setTone(event.target.value)}>
              <option value="professional">Profesional</option>
              <option value="friendly">Cercano</option>
              <option value="concise">Conciso</option>
              <option value="empathetic">Empático</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instrucciones adicionales</Label>
            <Input id="instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} />
          </div>
          <Button
            className="w-full"
            onClick={() =>
              toast.success("Respuesta mock generada", {
                description: "En Fase 4 esto llamará generate-ai-draft desde una Edge Function.",
              })
            }
          >
            <Bot className="h-4 w-4" />
            Generar respuesta
          </Button>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            El modo mock trata mensajes del ticket y conocimiento como datos de referencia no confiables.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{selectedTicket?.subject ?? "Sin ticket seleccionado"}</CardTitle>
            <CardDescription>Se muestra un resumen de razonamiento; nunca se expone chain-of-thought interno.</CardDescription>
          </div>
          <Badge tone={(draft?.confidence ?? selectedTicket?.ai_confidence ?? 0) >= 0.85 ? "emerald" : "amber"}>
            {confidenceLabel(draft?.confidence ?? selectedTicket?.ai_confidence)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-950">Respuesta sugerida</p>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {draft?.draft_body ??
                "Hola, gracias por escribir. Revisé la guía de soporte disponible y esta solicitud debe mantenerse con revisión humana hasta tener evidencia suficiente para responder con confianza."}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-950">Resumen de razonamiento</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                La respuesta usa artículos relevantes y limita compromisos. Requiere revisión cuando aparecen facturación, cancelación, seguridad o falta de contexto.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-950">Banderas de riesgo</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(draft?.risk_flags.length ? draft.risk_flags : ["missing_context"]).map((flag) => (
                  <Badge key={flag} tone={flag.includes("security") || flag.includes("payment") ? "rose" : "amber"}>
                    {riskFlagLabel(flag)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">Fuentes citadas</p>
            <div className="mt-3 grid gap-3">
              {sources.map((source) => (
                <div key={source.source_id} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-950">{source.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{source.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

