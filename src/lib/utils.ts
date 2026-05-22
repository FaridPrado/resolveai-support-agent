import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(value)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value)
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Sin fecha"
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function formatDate(value?: string | null) {
  if (!value) return "Sin fecha"
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function confidenceLabel(confidence?: number | null) {
  if (confidence == null) return "Sin evaluar"
  if (confidence >= 0.85) return "Alta confianza"
  if (confidence >= 0.6) return "Requiere revisión"
  return "Baja confianza"
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function safeText(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "")
}

