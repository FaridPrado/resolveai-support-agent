import type {
  Channel,
  DraftStatus,
  KnowledgeStatus,
  MemberStatus,
  Plan,
  Role,
  Sentiment,
  TicketPriority,
  TicketStatus,
} from "../types/domain"

export const planLabels: Record<Plan, string> = {
  enterprise: "Enterprise",
  free: "Gratis",
  pro: "Pro",
}

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  agent: "Agente",
  owner: "Propietario",
  viewer: "Lectura",
}

export const memberStatusLabels: Record<MemberStatus, string> = {
  active: "Activo",
  invited: "Invitado",
  suspended: "Suspendido",
}

export const ticketStatusLabels: Record<TicketStatus, string> = {
  closed: "Cerrado",
  new: "Nuevo",
  open: "Abierto",
  pending: "Pendiente",
  solved: "Resuelto",
  spam: "Spam",
}

export const priorityLabels: Record<TicketPriority, string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
  urgent: "Urgente",
}

export const sentimentLabels: Record<Sentiment, string> = {
  angry: "Molesto",
  negative: "Negativo",
  neutral: "Neutral",
  positive: "Positivo",
}

export const channelLabels: Record<Channel, string> = {
  api: "API",
  chat: "Chat",
  demo: "Demo",
  email: "Correo",
  web_form: "Formulario",
  whatsapp: "WhatsApp",
}

export const knowledgeStatusLabels: Record<KnowledgeStatus, string> = {
  active: "Activa",
  failed: "Fallida",
  inactive: "Inactiva",
  processing: "Procesando",
}

export const draftStatusLabels: Record<DraftStatus, string> = {
  approved: "Aprobado",
  draft: "Borrador",
  edited: "Editado",
  rejected: "Rechazado",
  sent_simulated: "Envío simulado",
}

export const riskFlagLabels: Record<string, string> = {
  account_access_issue: "Acceso a cuenta",
  angry_customer: "Cliente molesto",
  legal_sensitive: "Riesgo legal",
  missing_context: "Falta contexto",
  payment_issue: "Pago o facturación",
  pii_detected: "PII detectada",
  possible_prompt_injection: "Posible prompt injection",
  refund_request: "Solicitud de reembolso",
  security_sensitive: "Seguridad sensible",
}

export function riskFlagLabel(flag: string) {
  return riskFlagLabels[flag] ?? flag.replaceAll("_", " ")
}

export const categoryLabels: Record<string, string> = {
  Billing: "Facturación",
  "Bug report": "Reporte de bug",
  Cancellation: "Cancelación",
  "Feature request": "Solicitud de mejora",
  "General question": "Pregunta general",
  "Login/access": "Acceso/login",
  Refund: "Reembolso",
  Security: "Seguridad",
  "Technical issue": "Problema técnico",
  Uncategorized: "Sin categoría",
}

export function categoryLabel(category?: string | null) {
  if (!category) return "Sin categoría"
  return categoryLabels[category] ?? category
}

export const auditActionLabels: Record<string, string> = {
  "ai draft generated": "borrador IA generado",
  "automation rule created": "regla de automatización creada",
  "demo data loaded": "datos demo cargados",
  "knowledge source ingested": "fuente de conocimiento ingerida",
  "organization created": "organización creada",
  "suspicious prompt injection detected": "prompt injection sospechoso detectado",
  "ticket classified": "ticket clasificado",
  "ticket created": "ticket creado",
}

export function auditActionLabel(action: string) {
  return auditActionLabels[action] ?? action
}

export const entityLabels: Record<string, string> = {
  ai_draft: "Borrador IA",
  automation_rule: "Regla",
  knowledge_source: "Fuente",
  organization: "Organización",
  ticket: "Ticket",
}

export function entityLabel(entity: string) {
  return entityLabels[entity] ?? entity
}

