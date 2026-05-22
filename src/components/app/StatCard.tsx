import { type ReactNode } from "react"
import { Card } from "../ui/card"
import { cn } from "../../lib/utils"

interface StatCardProps {
  description?: string
  icon: ReactNode
  label: string
  tone?: "blue" | "emerald" | "amber" | "rose" | "slate"
  value: string
}

const tones = {
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
}

export function StatCard({ description, icon, label, tone = "slate", value }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>
          {icon}
        </div>
      </div>
      {description ? <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p> : null}
    </Card>
  )
}
