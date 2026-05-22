import { Bot, ShieldCheck } from "lucide-react"
import { type ReactNode } from "react"
import { ResolveMark } from "../../components/brand/ResolveMark"
import { ThemeToggle } from "../../components/theme/ThemeToggle"
import { Badge } from "../../components/ui/badge"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_0.92fr]">
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle compact />
      </div>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
      <section className="hidden border-l border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col justify-between p-10">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-slate-200">
              <ResolveMark className="h-9 w-9" />
            </div>
            <h1 className="mt-8 max-w-lg text-4xl font-semibold tracking-tight text-slate-950">
              Soporte con IA donde las personas mantienen el control.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              ResolveAI ofrece a equipos de soporte un espacio seguro para generar borradores
              con IA, priorizar tickets, consultar conocimiento y aprobar respuestas con trazabilidad.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Modo mock incluido</p>
                  <p className="text-sm text-slate-500">Demuestra flujos realistas sin claves API externas.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Multi-tenant desde el diseño</p>
                  <p className="text-sm text-slate-500">RLS y auditoría forman parte del esquema base.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge tone="emerald">Aprobación humana requerida</Badge>
              <Badge tone="blue">RLS listo</Badge>
              <Badge tone="amber">Sin secretos en cliente</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
