export type Plan = "free" | "pro" | "enterprise"
export type Role = "owner" | "admin" | "agent" | "viewer"
export type MemberStatus = "active" | "invited" | "suspended"
export type TicketStatus = "new" | "open" | "pending" | "solved" | "closed" | "spam"
export type TicketPriority = "low" | "medium" | "high" | "urgent"
export type Sentiment = "positive" | "neutral" | "negative" | "angry"
export type Channel = "email" | "chat" | "whatsapp" | "web_form" | "api" | "demo"
export type SenderType = "customer" | "agent" | "ai" | "system"
export type DraftStatus = "draft" | "approved" | "rejected" | "edited" | "sent_simulated"
export type Tone = "professional" | "friendly" | "concise" | "empathetic"
export type KnowledgeStatus = "active" | "inactive" | "processing" | "failed"
export type KnowledgeSourceType = "article" | "faq" | "url" | "pdf" | "doc" | "manual" | "snippet"
export type AutomationTrigger =
  | "new_ticket"
  | "message_received"
  | "priority_changed"
  | "stale_ticket"

export interface UserProfile {
  id: string
  email: string
  name: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: Plan
  industry?: string
  monthly_ticket_volume?: string
  timezone?: string
  hourly_cost?: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: Role
  status: MemberStatus
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  organization_id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  external_id?: string | null
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  organization_id: string
  customer_id: string
  assigned_to?: string | null
  channel: Channel
  subject: string
  status: TicketStatus
  priority: TicketPriority
  sentiment: Sentiment
  intent?: string | null
  category?: string | null
  language?: string | null
  sla_due_at?: string | null
  ai_confidence?: number | null
  ai_summary?: string | null
  ai_recommended_action?: string | null
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  organization_id: string
  ticket_id: string
  sender_type: SenderType
  sender_name: string
  sender_email?: string | null
  body: string
  body_plain: string
  internal_note: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export interface AiDraft {
  id: string
  organization_id: string
  ticket_id: string
  created_by?: string | null
  status: DraftStatus
  draft_body: string
  tone: Tone
  confidence: number
  cited_sources: Array<{ title: string; source_id: string; excerpt: string }>
  risk_flags: string[]
  model_used: string
  prompt_version: string
  created_at: string
  updated_at: string
}

export interface KnowledgeSource {
  id: string
  organization_id: string
  title: string
  source_type: KnowledgeSourceType
  status: KnowledgeStatus
  content: string
  file_path?: string | null
  tags?: string[]
  metadata: Record<string, unknown>
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface KnowledgeChunk {
  id: string
  organization_id: string
  knowledge_source_id: string
  chunk_index: number
  title?: string | null
  content: string
  embedding?: number[] | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface AutomationRule {
  id: string
  organization_id: string
  name: string
  description?: string | null
  enabled: boolean
  trigger_type: AutomationTrigger
  conditions: Record<string, unknown>
  actions: Record<string, unknown>
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  organization_id: string
  user_id?: string | null
  actor_type: "user" | "ai" | "system"
  action: string
  entity_type: string
  entity_id?: string | null
  ip_address?: string | null
  user_agent?: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface AgentFeedback {
  id: string
  organization_id: string
  ticket_id: string
  ai_draft_id: string
  rating: "helpful" | "not_helpful" | "unsafe" | "inaccurate"
  comment?: string | null
  created_by?: string | null
  created_at: string
}

export interface IntegrationConnection {
  id: string
  organization_id: string
  provider: "zendesk" | "intercom" | "gmail" | "slack" | "whatsapp" | "custom_api" | "demo"
  status: "connected" | "disconnected" | "error" | "demo"
  config: Record<string, unknown>
  encrypted_secret_reference?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  organization_id: string
  event_type: string
  entity_type?: string | null
  entity_id?: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface WorkspaceData {
  organizations: Organization[]
  organization_members: OrganizationMember[]
  customers: Customer[]
  tickets: Ticket[]
  ticket_messages: TicketMessage[]
  ai_drafts: AiDraft[]
  knowledge_sources: KnowledgeSource[]
  knowledge_chunks: KnowledgeChunk[]
  automation_rules: AutomationRule[]
  audit_logs: AuditLog[]
  agent_feedback: AgentFeedback[]
  integration_connections: IntegrationConnection[]
  analytics_events: AnalyticsEvent[]
}

export interface DashboardMetrics {
  openTickets: number
  urgentTickets: number
  aiDraftsGenerated: number
  estimatedTimeSavedMinutes: number
  averageConfidence: number
  knowledgeGaps: number
  ticketsTriaged: number
  repetitiveIssues: number
  monthlySavingsEstimate: number
}
