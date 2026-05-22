import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input, Label } from "../../components/ui/input"
import { useAuth } from "../../contexts/AuthContext"
import { showSafeError } from "../../services/workspaceStore"
import { AuthLayout } from "./AuthLayout"

const schema = z.object({
  email: z.string().email("Ingresa un correo laboral válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
})

type LoginValues = z.infer<typeof schema>

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginValues>({
    defaultValues: { email: "demo@resolveai.local", password: "demo-password" },
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true)
      await signIn(values.email, values.password)
      navigate("/dashboard")
    } catch (error) {
      showSafeError(error)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AuthLayout>
      <div>
        <p className="text-sm font-semibold text-blue-700">ResolveAI Support Agent</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Bienvenido de nuevo</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Inicia sesión para gestionar soporte asistido por IA con aprobación humana e
          aislamiento por organización.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Correo laboral</Label>
          <Input id="email" autoComplete="email" {...register("email")} />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link className="text-sm font-medium text-blue-700 hover:text-blue-800" to="/forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          {errors.password ? (
            <p className="text-sm text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>
        <Button className="w-full" disabled={submitting} size="lg" type="submit">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Iniciar sesión
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <Button
        className="mt-3 w-full"
        disabled={submitting}
        size="lg"
        variant="outline"
        onClick={async () => {
          try {
            setSubmitting(true)
            await signIn("demo@resolveai.local", "demo-password")
            navigate("/dashboard")
          } catch (error) {
            showSafeError(error)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        Continuar en modo mock
      </Button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Nuevo en ResolveAI?{" "}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/signup">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  )
}
