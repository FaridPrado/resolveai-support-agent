import {
  Bot,
  CheckCircle2,
  CreditCard,
  KeyRound,
  LockKeyhole,
  PlugZap,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input, Label, Select } from "../../components/ui/input"
import { useAuth } from "../../contexts/AuthContext"
import { memberStatusLabels, roleLabels } from "../../lib/labels"
import { canManageMembers, canManageWorkspace, permissionText } from "../../lib/permissions"
import { isSupabaseConfigured } from "../../lib/supabase"

export function SettingsPage() {
  const { data, member, organization } = useAuth()
  const members = data.organization_members
  const canManageOrg = canManageWorkspace(member?.role)
  const canInvite = canManageMembers(member?.role)

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Organización</CardTitle>
            <CardDescription>Configuración global del tenant actual.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre de la organización</Label>
              <Input value={organization?.name ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={organization?.slug ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Industria</Label>
              <Input value={organization?.industry ?? "SaaS"} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Zona horaria</Label>
              <Input value={organization?.timezone ?? "America/Bogota"} readOnly />
            </div>
          </CardContent>
        </Card>

        <SecurityPosture />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Miembros</CardTitle>
              <CardDescription>Base de control de acceso por roles.</CardDescription>
            </div>
            <Button disabled={!canInvite} title={!canInvite ? permissionText("invitar miembros") : undefined} variant="outline">
              <Users className="h-4 w-4" />
              Invitar miembro
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.user_id === member?.user_id ? "You" : item.user_id}</p>
                  <p className="mt-1 text-xs text-slate-500">{memberStatusLabels[item.status]}</p>
                </div>
                <Badge tone={item.role === "owner" ? "slate" : "blue"}>{roleLabels[item.role]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de IA</CardTitle>
            <CardDescription>Proveedor, tono y umbrales de seguridad.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Proveedor IA</Label>
              <Select disabled={!canManageOrg} defaultValue="Modo mock" title={!canManageOrg ? permissionText("cambiar configuración de IA") : undefined}>
                <option>Modo mock</option>
                <option>OpenAI</option>
                <option>Anthropic</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tono predeterminado</Label>
              <Select disabled={!canManageOrg} defaultValue="Profesional" title={!canManageOrg ? permissionText("cambiar configuración de IA") : undefined}>
                <option>Profesional</option>
                <option>Cercano</option>
                <option>Conciso</option>
              <option>Empático</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Umbral de confianza</Label>
              <Input value="0.85 alta confianza / 0.60 revisión" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Envío automático</Label>
              <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3">
                <Badge tone="rose">Desactivado en MVP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Integraciones</CardTitle>
            <CardDescription>El conector demo está disponible; los conectores productivos quedan como pendientes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Conector demo", "demo"],
              ["Webhook API custom", "desconectado"],
              ["Zendesk", "pendiente"],
              ["Intercom", "pendiente"],
              ["Gmail", "pendiente"],
              ["Slack", "pendiente"],
            ].map(([name, status]) => (
              <div key={name} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <PlugZap className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-950">{name}</p>
                </div>
                <Badge tone={status === "demo" ? "emerald" : "gray"}>{status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Facturación</CardTitle>
            <CardDescription>Planes visuales solamente; sin procesamiento de pagos en el MVP.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {["Free", "Pro", "Enterprise"].map((plan) => (
              <div key={plan} className="rounded-lg border border-slate-200 p-4">
                <CreditCard className="h-5 w-5 text-slate-500" />
                <p className="mt-3 text-sm font-semibold text-slate-950">{plan}</p>
                <p className="mt-1 text-xs text-slate-500">{plan === "Pro" ? "Plan visual actual" : "Disponible"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function SecurityPosture() {
  const items = [
    ["RLS habilitado", "Todas las tablas de la app incluyen policies de row level security.", ShieldCheck, true],
    ["Secretos en servidor", "Secretos de IA y webhooks solo los leen Edge Functions.", KeyRound, true],
    ["Auditoría habilitada", "Las acciones sensibles escriben eventos de auditoría.", CheckCircle2, true],
    ["Aprobación humana requerida", "Las respuestas de IA nunca se auto-envían en esta versión.", Bot, true],
    ["Firmas de webhook", "El contrato requiere webhooks firmados.", LockKeyhole, true],
    ["Cliente Supabase", isSupabaseConfigured ? "Configurado con variables de Vite." : "Modo mock hasta agregar variables.", PlugZap, isSupabaseConfigured],
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>Postura de seguridad</CardTitle>
        <CardDescription>Controles de preparación productiva visibles para compradores y admins.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(([title, description, Icon, enabled]) => (
          <div key={title} className="flex gap-3 rounded-lg border border-slate-200 p-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-md ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

