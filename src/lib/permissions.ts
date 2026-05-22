import type { Role } from "../types/domain"

export function canManageWorkspace(role?: Role | null) {
  return role === "owner" || role === "admin"
}

export function canManageMembers(role?: Role | null) {
  return role === "owner"
}

export function canManageKnowledge(role?: Role | null) {
  return role === "owner" || role === "admin"
}

export function canManageAutomations(role?: Role | null) {
  return role === "owner" || role === "admin"
}

export function canRespondToTickets(role?: Role | null) {
  return role === "owner" || role === "admin" || role === "agent"
}

export function permissionText(action: string) {
  return `Tu rol actual no permite ${action}.`
}
