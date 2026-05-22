import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  ChevronDown,
  ClipboardList,
  DatabaseZap,
  Gauge,
  Inbox,
  LockKeyhole,
  Menu,
  MonitorPlay,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react"
import { useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ResolveMark } from "../brand/ResolveMark"
import { ThemeToggle } from "../theme/ThemeToggle"
import { useAuth } from "../../contexts/AuthContext"
import { cn, initials } from "../../lib/utils"
import { planLabels, roleLabels } from "../../lib/labels"
import { canRespondToTickets, permissionText } from "../../lib/permissions"

const navigation = [
  { icon: Gauge, label: "Panel", path: "/dashboard" },
  { icon: MonitorPlay, label: "Demo guiada", path: "/demo" },
  { icon: Inbox, label: "Bandeja", path: "/inbox" },
  { icon: BookOpen, label: "Base de conocimiento", path: "/knowledge" },
  { icon: Bot, label: "Pruebas de IA", path: "/playground" },
  { icon: Workflow, label: "Automatizaciones", path: "/automations" },
  { icon: BarChart3, label: "Analítica", path: "/analytics" },
  { icon: Users, label: "Clientes", path: "/customers" },
  { icon: ClipboardList, label: "Auditoría", path: "/audit-logs" },
  { icon: Settings, label: "Configuración", path: "/settings" },
]

const pageTitles: Record<string, string> = {
  "/analytics": "Analítica",
  "/audit-logs": "Auditoría",
  "/automations": "Automatizaciones",
  "/customers": "Clientes",
  "/dashboard": "Panel",
  "/demo": "Demo guiada",
  "/inbox": "Bandeja",
  "/knowledge": "Base de conocimiento",
  "/playground": "Pruebas de IA",
  "/settings": "Configuración",
}

export function AppShell() {
  const { data, dataModeDescription, member, organization, signOut, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const canCreateDemoTicket = canRespondToTickets(member?.role)

  const createDemoTicket = () => {
    if (!canCreateDemoTicket) {
      toast.error("Acción no permitida", {
        description: permissionText("crear tickets demo"),
      })
      return
    }
    toast.info("Acción pendiente de la Fase 3", {
      description: "La ingesta está preparada; la creación real queda detrás de Edge Functions.",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-slate-200">
            <ResolveMark className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">ResolveAI</p>
            <p className="truncate text-xs text-slate-500">Agente de soporte</p>
          </div>
        </div>

        <div className="border-b border-slate-100 px-4 py-4">
          <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:bg-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{organization?.name}</p>
              <p className="truncate text-xs text-slate-500">Plan {organization?.plan ? planLabels[organization.plan] : "Gratis"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <nav className="subtle-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )
              }
              onClick={() => setMobileOpen(false)}
              to={item.path}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <p className="text-xs font-semibold">Postura de seguridad</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <LockKeyhole className="h-3 w-3" /> RLS
              </span>
              <span className="flex items-center gap-1">
              <DatabaseZap className="h-3 w-3" /> Secretos
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" /> Auditoría
              </span>
              <span className="flex items-center gap-1">
                <Bot className="h-3 w-3" /> HITL
              </span>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <Button
            aria-label="Open navigation"
            className="lg:hidden"
            size="icon"
            variant="ghost"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight text-slate-950">
              {pageTitles[location.pathname] ?? "Workspace"}
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">{dataModeDescription}</p>
          </div>

          <label className="hidden h-10 w-full max-w-md items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition-within focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 md:flex">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Buscar tickets, clientes o artículos..."
            />
          </label>

          <ThemeToggle compact />

          <Button variant="outline" onClick={createDemoTicket}>
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Crear ticket demo</span>
          </Button>

          <Badge tone={data.tickets.length > 0 ? "emerald" : "amber"}>
            {data.tickets.length > 0 ? "Modo demo" : "Listo"}
          </Badge>

          <button
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 shadow-sm transition hover:bg-slate-50"
            onClick={() =>
              toast("Usuario conectado", {
                action: {
                  label: "Salir",
                  onClick: signOut,
                },
                description: `${user?.email} - ${member?.role ? roleLabels[member.role] : "Miembro"}`,
              })
            }
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials(user?.name ?? "IA")}
            </span>
            <span className="hidden text-sm font-medium text-slate-700 md:inline">{user?.name}</span>
          </button>
        </header>

        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

