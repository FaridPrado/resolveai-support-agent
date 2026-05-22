import { subDays } from "date-fns"
import type { DashboardMetrics, Ticket, WorkspaceData } from "../types/domain"
import { categoryLabel } from "./labels"

export function organizationData(data: WorkspaceData, organizationId?: string | null): WorkspaceData {
  if (!organizationId) return data
  return {
    ai_drafts: data.ai_drafts.filter((item) => item.organization_id === organizationId),
    agent_feedback: data.agent_feedback.filter((item) => item.organization_id === organizationId),
    analytics_events: data.analytics_events.filter((item) => item.organization_id === organizationId),
    audit_logs: data.audit_logs.filter((item) => item.organization_id === organizationId),
    automation_rules: data.automation_rules.filter((item) => item.organization_id === organizationId),
    customers: data.customers.filter((item) => item.organization_id === organizationId),
    integration_connections: data.integration_connections.filter((item) => item.organization_id === organizationId),
    knowledge_chunks: data.knowledge_chunks.filter((item) => item.organization_id === organizationId),
    knowledge_sources: data.knowledge_sources.filter((item) => item.organization_id === organizationId),
    organization_members: data.organization_members.filter((item) => item.organization_id === organizationId),
    organizations: data.organizations.filter((item) => item.id === organizationId),
    ticket_messages: data.ticket_messages.filter((item) => item.organization_id === organizationId),
    tickets: data.tickets.filter((item) => item.organization_id === organizationId),
  }
}

export function computeMetrics(data: WorkspaceData, hourlyCost = 25): DashboardMetrics {
  const openTickets = data.tickets.filter((ticket) =>
    ["new", "open", "pending"].includes(ticket.status),
  ).length
  const urgentTickets = data.tickets.filter((ticket) => ticket.priority === "urgent").length
  const aiDraftsGenerated = data.ai_drafts.length
  const ticketsTriaged = data.analytics_events.filter(
    (event) => event.event_type === "ticket_classified",
  ).length
  const estimatedTimeSavedMinutes = aiDraftsGenerated * 4 + ticketsTriaged
  const averageConfidence =
    data.tickets.reduce((total, ticket) => total + (ticket.ai_confidence ?? 0), 0) /
    Math.max(data.tickets.length, 1)
  const categoryCounts = countBy(data.tickets, (ticket) => categoryLabel(ticket.category))
  const repetitiveIssues = Object.values(categoryCounts).filter((count) => count > 1).length
  const knowledgeGaps = Math.max(
    0,
    new Set(data.tickets.map((ticket) => ticket.category).filter(Boolean)).size -
      data.knowledge_sources.length,
  )
  const monthlySavingsEstimate = (estimatedTimeSavedMinutes / 60) * hourlyCost * 4

  return {
    aiDraftsGenerated,
    averageConfidence,
    estimatedTimeSavedMinutes,
    knowledgeGaps,
    monthlySavingsEstimate,
    openTickets,
    repetitiveIssues,
    ticketsTriaged,
    urgentTickets,
  }
}

export function countBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = key(item)
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
}

export function ticketCategoryChart(data: WorkspaceData) {
  return Object.entries(countBy(data.tickets, (ticket) => categoryLabel(ticket.category))).map(
    ([name, value]) => ({ name, value }),
  )
}

export function sentimentChart(data: WorkspaceData) {
  return Object.entries(countBy(data.tickets, (ticket) => ticket.sentiment)).map(
    ([name, value]) => ({ name, value }),
  )
}

export function volumeChart(data: WorkspaceData) {
  const today = new Date("2026-05-22T00:00:00-05:00")
  return Array.from({ length: 7 }, (_, index) => {
    const date = subDays(today, 6 - index)
    const label = date.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
    const dayKey = date.toISOString().slice(0, 10)
    const tickets = data.tickets.filter((ticket) => ticket.created_at.slice(0, 10) === dayKey).length
    const drafts = data.ai_drafts.filter((draft) => draft.created_at.slice(0, 10) === dayKey).length
    return { date: label, drafts, tickets }
  })
}

export function todaysPriorities(data: WorkspaceData) {
  return [...data.tickets]
    .sort((a, b) => priorityWeight(b) - priorityWeight(a))
    .slice(0, 5)
}

function priorityWeight(ticket: Ticket) {
  const priority = { high: 3, low: 1, medium: 2, urgent: 4 }[ticket.priority]
  const confidenceRisk = (ticket.ai_confidence ?? 1) < 0.6 ? 2 : 0
  const sentimentRisk = ticket.sentiment === "angry" ? 2 : ticket.sentiment === "negative" ? 1 : 0
  return priority + confidenceRisk + sentimentRisk
}

export function topRecurringIssues(data: WorkspaceData) {
  return Object.entries(countBy(data.tickets, (ticket) => categoryLabel(ticket.category)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }))
}
