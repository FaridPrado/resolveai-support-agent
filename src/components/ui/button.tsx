import { Slot } from "@radix-ui/react-slot"
import { type ButtonHTMLAttributes, type ReactNode } from "react"
import { cn } from "../../lib/utils"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline"
type ButtonSize = "sm" | "md" | "lg" | "icon"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-950/10 hover:bg-rose-700 active:bg-rose-800",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200",
  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50",
  primary:
    "bg-slate-950 text-white shadow-sm shadow-slate-950/20 hover:bg-slate-800 active:bg-slate-900",
  secondary:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100 hover:bg-blue-100 active:bg-blue-200",
}

const sizes: Record<ButtonSize, string> = {
  icon: "h-9 w-9 p-0",
  lg: "h-11 px-5 text-sm",
  md: "h-9 px-4 text-sm",
  sm: "h-8 px-3 text-xs",
}

export function Button({
  asChild,
  className,
  children,
  disabled,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button"

  return (
    <Component
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </Component>
  )
}
