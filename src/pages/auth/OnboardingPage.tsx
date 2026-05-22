import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { ResolveMark } from "../../components/brand/ResolveMark"
import { ThemeToggle } from "../../components/theme/ThemeToggle"
import { Card, CardContent } from "../../components/ui/card"
import { Input, Label, Select } from "../../components/ui/input"
import { useAuth } from "../../contexts/AuthContext"
import { slugify } from "../../lib/utils"
import { showSafeError } from "../../services/workspaceStore"

const industries = ["SaaS", "Ecommerce", "Fintech", "Educación", "Salud", "Agencia", "Otro"]
const volumes = ["<500", "500-2k", "2k-10k", "10k+"]

const schema = z.object({
  industry: z.string().min(1),
  loadDemo: z.boolean().optional(),
  monthly_ticket_volume: z.string().min(1),
  name: z.string().min(2, "Ingresa el nombre de la organización."),
  slug: z.string().min(2, "Ingresa un slug.").regex(/^[a-z0-9-]+$/, "Usa minúsculas, números y guiones."),
})

type OnboardingValues = z.infer<typeof schema>

export function OnboardingPage() {
  const { createOrganization, loadDemoData, organization } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setValue,
  } = useForm<OnboardingValues>({
    defaultValues: {
      industry: "SaaS",
      loadDemo: true,
      monthly_ticket_volume: "500-2k",
      name: organization?.name ?? "",
      slug: organization?.slug ?? "",
    },
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true)
      const createdOrganization = organization ?? (await createOrganization(values))
      if (values.loadDemo) {
        await loadDemoData(createdOrganization)
      }
      navigate("/dashboard")
    } catch (error) {
      showSafeError(error)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle compact />
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-slate-200">
            <ResolveMark className="h-9 w-9" />
          </div>
          <h1 className="mt-8 max-w-lg text-4xl font-semibold tracking-tight text-slate-950">
            Configura tu espacio de soporte.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            ResolveAI inicia con aislamiento por organización, membresía de propietario y datos
            demo seguros para mostrar operaciones reales de soporte desde el primer recorrido.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Modelo de datos aislado por organización",
              "Rol propietario creado durante el onboarding",
              "Tickets, clientes, conocimiento, analítica y auditoría demo",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <Card className="self-start">
          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">Crear organización</h2>
                <p className="mt-1 text-sm text-slate-500">Podrás invitar a tu equipo cuando el espacio esté listo.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nombre de la organización</Label>
                  <Input
                    id="name"
                    placeholder="Acme Cloud Support"
                    {...register("name")}
                    onBlur={(event) => {
                      if (!getValues("slug")) setValue("slug", slugify(event.target.value))
                    }}
                  />
                  {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="slug">Slug del espacio</Label>
                  <Input id="slug" placeholder="acme-cloud-support" {...register("slug")} />
                  {errors.slug ? <p className="text-sm text-rose-600">{errors.slug.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria</Label>
                  <Select id="industry" {...register("industry")}>
                    {industries.map((industry) => (
                      <option key={industry}>{industry}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_ticket_volume">Volumen mensual de tickets</Label>
                  <Select id="monthly_ticket_volume" {...register("monthly_ticket_volume")}>
                    {volumes.map((volume) => (
                      <option key={volume}>{volume}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <input className="mt-1 h-4 w-4 accent-blue-600" type="checkbox" {...register("loadDemo")} />
                <span>
                  <span className="block text-sm font-semibold text-blue-950">Cargar conocimiento y tickets demo</span>
                  <span className="mt-1 block text-sm leading-6 text-blue-800">
                    Recomendado para demos comerciales. Incluye casos de prompt injection,
                    facturación, acceso, reembolsos, API y solicitudes de producto.
                  </span>
                </span>
              </label>

              <Button className="w-full" disabled={submitting} size="lg" type="submit">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Entrar al espacio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
