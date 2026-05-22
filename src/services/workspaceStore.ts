import { toast } from "sonner"
import { buildDemoWorkspace, createEmptyWorkspace } from "../data/demoData"
import { isSupabaseConfigured, supabase } from "../lib/supabase"
import { slugify } from "../lib/utils"
import type {
  Organization,
  OrganizationMember,
  Role,
  UserProfile,
  WorkspaceData,
} from "../types/domain"

const DATA_KEY = "resolveai.workspace.v1"
const SESSION_KEY = "resolveai.session.v1"

export interface LocalSession {
  currentOrganizationId?: string
  user: UserProfile
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function readLocalSession() {
  return readJson<LocalSession | null>(SESSION_KEY, null)
}

export function writeLocalSession(session: LocalSession | null) {
  if (session) {
    writeJson(SESSION_KEY, session)
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function readLocalData(): WorkspaceData {
  return readJson<WorkspaceData>(DATA_KEY, createEmptyWorkspace())
}

export function writeLocalData(data: WorkspaceData) {
  writeJson(DATA_KEY, data)
}

export function createLocalUser(email: string, name?: string): UserProfile {
  return {
    email,
    id: crypto.randomUUID(),
    name: name || email.split("@")[0] || "Lider de soporte",
  }
}

export function createLocalOrganization(
  user: UserProfile,
  input: {
    industry: string
    monthly_ticket_volume: string
    name: string
    slug?: string
  },
) {
  const data = readLocalData()
  const organization: Organization = {
    created_at: new Date().toISOString(),
    created_by: user.id,
    hourly_cost: 25,
    id: crypto.randomUUID(),
    industry: input.industry,
    monthly_ticket_volume: input.monthly_ticket_volume,
    name: input.name,
    plan: "free",
    slug: input.slug || slugify(input.name),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updated_at: new Date().toISOString(),
  }

  const member: OrganizationMember = {
    created_at: organization.created_at,
    id: crypto.randomUUID(),
    organization_id: organization.id,
    role: "owner",
    status: "active",
    updated_at: organization.updated_at,
    user_id: user.id,
  }

  writeLocalData({
    ...data,
    organization_members: [...data.organization_members, member],
    organizations: [...data.organizations, organization],
  })
  writeLocalSession({ currentOrganizationId: organization.id, user })
  return { member, organization }
}

export function loadLocalDemoData(user: UserProfile, organization?: Organization) {
  const demo = buildDemoWorkspace(user, organization)
  writeLocalData(demo)
  writeLocalSession({ currentOrganizationId: demo.organizations[0]?.id, user })
  return demo
}

export function getCurrentLocalWorkspace(session: LocalSession | null) {
  const data = readLocalData()
  const organization =
    data.organizations.find((item) => item.id === session?.currentOrganizationId) ??
    data.organizations.find((item) =>
      data.organization_members.some(
        (member) => member.organization_id === item.id && member.user_id === session?.user.id,
      ),
    ) ??
    null

  const member =
    data.organization_members.find(
      (item) => item.organization_id === organization?.id && item.user_id === session?.user.id,
    ) ?? null

  return { data, member, organization }
}

export async function fetchSupabaseWorkspace(user: UserProfile) {
  if (!supabase) throw new Error("Supabase is not configured")

  const { data: memberships, error: memberError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)

  if (memberError) throw memberError

  const member = (memberships?.[0] as OrganizationMember | undefined) ?? null
  if (!member) {
    return { data: createEmptyWorkspace(), member: null, organization: null }
  }

  const organizationId = member.organization_id

  const [
    organizations,
    customers,
    tickets,
    messages,
    drafts,
    sources,
    chunks,
    rules,
    logs,
    feedback,
    integrations,
    events,
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", organizationId),
    supabase.from("customers").select("*").eq("organization_id", organizationId),
    supabase.from("tickets").select("*").eq("organization_id", organizationId).order("last_message_at", { ascending: false }),
    supabase.from("ticket_messages").select("*").eq("organization_id", organizationId).order("created_at"),
    supabase.from("ai_drafts").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("knowledge_sources").select("*").eq("organization_id", organizationId).order("updated_at", { ascending: false }),
    supabase.from("knowledge_chunks").select("*").eq("organization_id", organizationId),
    supabase.from("automation_rules").select("*").eq("organization_id", organizationId),
    supabase.from("audit_logs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("agent_feedback").select("*").eq("organization_id", organizationId),
    supabase.from("integration_connections").select("*").eq("organization_id", organizationId),
    supabase.from("analytics_events").select("*").eq("organization_id", organizationId),
  ])

  const responses = [
    organizations,
    customers,
    tickets,
    messages,
    drafts,
    sources,
    chunks,
    rules,
    logs,
    feedback,
    integrations,
    events,
  ]
  const error = responses.find((response) => response.error)?.error
  if (error) throw error

  const data: WorkspaceData = {
    ai_drafts: (drafts.data ?? []) as WorkspaceData["ai_drafts"],
    agent_feedback: (feedback.data ?? []) as WorkspaceData["agent_feedback"],
    analytics_events: (events.data ?? []) as WorkspaceData["analytics_events"],
    audit_logs: (logs.data ?? []) as WorkspaceData["audit_logs"],
    automation_rules: (rules.data ?? []) as WorkspaceData["automation_rules"],
    customers: (customers.data ?? []) as WorkspaceData["customers"],
    integration_connections: (integrations.data ?? []) as WorkspaceData["integration_connections"],
    knowledge_chunks: (chunks.data ?? []) as WorkspaceData["knowledge_chunks"],
    knowledge_sources: (sources.data ?? []) as WorkspaceData["knowledge_sources"],
    organization_members: [member],
    organizations: (organizations.data ?? []) as WorkspaceData["organizations"],
    ticket_messages: (messages.data ?? []) as WorkspaceData["ticket_messages"],
    tickets: (tickets.data ?? []) as WorkspaceData["tickets"],
  }

  return {
    data,
    member,
    organization: data.organizations[0] ?? null,
  }
}

export async function createSupabaseOrganization(
  input: {
    industry: string
    monthly_ticket_volume: string
    name: string
    slug?: string
  },
) {
  if (!supabase) throw new Error("Supabase is not configured")

  const { data, error } = await supabase.rpc("create_organization_with_owner", {
    org_industry: input.industry,
    org_monthly_ticket_volume: input.monthly_ticket_volume,
    org_name: input.name,
    org_slug: input.slug || slugify(input.name),
  })

  if (error) throw error
  return data as string
}

export async function loadSupabaseDemoData(organizationId: string) {
  if (!supabase) throw new Error("Supabase is not configured")
  const { error } = await supabase.rpc("load_demo_data", {
    target_organization_id: organizationId,
  })
  if (error) throw error
}

export function hasRole(role: Role | undefined | null, allowed: Role[]) {
  if (!role) return false
  return allowed.includes(role)
}

export function explainDataMode() {
  if (isSupabaseConfigured) {
    return "Conectado a Supabase con consultas protegidas por RLS."
  }

  return "Modo mock activo. No hay claves API ni secretos guardados en el navegador."
}

export function showSafeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Intenta nuevamente."
  toast.error("No se pudo completar la acción", {
    description:
      message.includes("JWT") || message.includes("permission") || message.includes("permite")
        ? "Tu sesión no está autorizada para esta acción."
        : message,
  })
}

