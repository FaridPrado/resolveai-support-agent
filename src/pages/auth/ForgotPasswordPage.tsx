import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input, Label } from "../../components/ui/input"
import { AuthLayout } from "./AuthLayout"

const schema = z.object({
  email: z.string().email("Ingresa un correo laboral válido."),
})

export function ForgotPasswordPage() {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout>
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950" to="/login">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio de sesión
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Restablecer contraseña</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Enviaremos un enlace si este correo pertenece a tu espacio de trabajo.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(() =>
          toast.success("Enlace preparado", {
            description: "En modo mock esto es simulado. Supabase Auth puede enviar el correo real.",
          }),
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Correo laboral</Label>
          <Input id="email" autoComplete="email" {...register("email")} />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>
        <Button className="w-full" size="lg" type="submit">
          <Mail className="h-4 w-4" />
          Enviar enlace
        </Button>
      </form>
    </AuthLayout>
  )
}
