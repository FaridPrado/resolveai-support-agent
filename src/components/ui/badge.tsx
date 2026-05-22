import { type HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

type BadgeTone =
  | "blue"
  | "cyan"
  | "emerald"
  | "gray"
  | "amber"
  | "rose"
  | "violet"
  | "slate"

const tones: Record<BadgeTone, string> = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  gray: "bg-slate-50 text-slate-600 ring-slate-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-900 text-white ring-slate-900",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
}

export function Badge({
  className,
  tone = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
