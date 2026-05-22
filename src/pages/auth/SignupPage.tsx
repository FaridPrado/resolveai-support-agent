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
  name: z.string().min(2, "Ingresa tu nombre."),
  password: z.string().min(8, "Usa al menos 8 caracteres."),
})

type SignupValues = z.infer<typeof schema>

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SignupValues>({
    defaultValues: { email: "", name: "", password: "" },
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true)
      await signUp(values)
      navigate("/onboarding")
    } catch (error) {
      showSafeError(error)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AuthLayout>
      <div>
        <p className="text-sm font-semibold text-blue-700">Automatización segura de soporte</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Crea tu cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Crea un espacio multi-tenant con Supabase Auth, RLS y modo mock como respaldo.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo laboral</Label>
          <Input id="email" autoComplete="email" {...register("email")} />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password ? (
            <p className="text-sm text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>
        <Button className="w-full" disabled={submitting} size="lg" type="submit">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ya tienes cuenta?{" "}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/login">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
