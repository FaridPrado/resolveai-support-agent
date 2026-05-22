/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"
import { isSupabaseConfigured, supabase } from "../lib/supabase"
import { organizationData } from "../lib/analytics"
import {
  createLocalOrganization,
  createLocalUser,
  createSupabaseOrganization,
  explainDataMode,
  fetchSupabaseWorkspace,
  getCurrentLocalWorkspace,
  loadLocalDemoData,
  loadSupabaseDemoData,
  readLocalSession,
  showSafeError,
  writeLocalSession,
} from "../services/workspaceStore"
import type {
  Organization,
  OrganizationMember,
  UserProfile,
  WorkspaceData,
} from "../types/domain"
import { createEmptyWorkspace } from "../data/demoData"

interface AuthContextValue {
  createOrganization: (input: {
    industry: string
    monthly_ticket_volume: string
    name: string
    slug?: string
  }) => Promise<Organization | null>
  data: WorkspaceData
  dataModeDescription: string
  loadDemoData: (targetOrganization?: Organization | null) => Promise<void>
  loading: boolean
  member: OrganizationMember | null
  organization: Organization | null
  refreshWorkspace: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (input: { email: string; name: string; password: string }) => Promise<void>
  user: UserProfile | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [member, setMember] = useState<OrganizationMember | null>(null)
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>(createEmptyWorkspace())
  const [loading, setLoading] = useState(true)

  const refreshWorkspace = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { data: sessionData, error } = await supabase.auth.getSession()
      if (error) throw error
      const sessionUser = sessionData.session?.user
      if (!sessionUser) {
        setUser(null)
        setOrganization(null)
        setMember(null)
        setWorkspaceData(createEmptyWorkspace())
        return
      }

      const profile: UserProfile = {
        email: sessionUser.email ?? "unknown@example.com",
        id: sessionUser.id,
        name:
          (sessionUser.user_metadata?.name as string | undefined) ??
          sessionUser.email?.split("@")[0] ??
          "Lider de soporte",
      }
      const workspace = await fetchSupabaseWorkspace(profile)
      setUser(profile)
      setOrganization(workspace.organization)
      setMember(workspace.member)
      setWorkspaceData(workspace.data)
      return
    }

    const session = readLocalSession()
    if (!session) {
      setUser(null)
      setOrganization(null)
      setMember(null)
      setWorkspaceData(createEmptyWorkspace())
      return
    }

    const workspace = getCurrentLocalWorkspace(session)
    setUser(session.user)
    setOrganization(workspace.organization)
    setMember(workspace.member)
    setWorkspaceData(workspace.data)
  }, [])

  useEffect(() => {
    refreshWorkspace()
      .catch(showSafeError)
      .finally(() => setLoading(false))

    if (!supabase) return
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      refreshWorkspace().catch(showSafeError)
    })
    return () => subscription.subscription.unsubscribe()
  }, [refreshWorkspace])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await refreshWorkspace()
        toast.success("Sesión iniciada")
        return
      }

      const sessionUser = createLocalUser(email, email.includes("demo") ? "Alex Rivera" : undefined)
      writeLocalSession({ currentOrganizationId: readLocalSession()?.currentOrganizationId, user: sessionUser })
      await refreshWorkspace()
      toast.success("Sesión iniciada en modo mock", {
        description: "Crea una organización y carga datos demo para explorar el producto.",
      })
    },
    [refreshWorkspace],
  )

  const signUp = useCallback(
    async (input: { email: string; name: string; password: string }) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: { data: { name: input.name } },
        })
        if (error) throw error
        await refreshWorkspace()
        toast.success("Cuenta creada", {
          description: "Si la confirmación por correo está activa, revisa tu email antes de continuar.",
        })
        return
      }

      const sessionUser = createLocalUser(input.email, input.name)
      writeLocalSession({ user: sessionUser })
      await refreshWorkspace()
      toast.success("Cuenta creada en modo mock")
    },
    [refreshWorkspace],
  )

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    writeLocalSession(null)
    setUser(null)
    setOrganization(null)
    setMember(null)
    setWorkspaceData(createEmptyWorkspace())
  }, [])

  const createOrganization = useCallback(
    async (input: {
      industry: string
      monthly_ticket_volume: string
      name: string
      slug?: string
    }) => {
      if (!user) throw new Error("Necesitas iniciar sesión.")

      if (isSupabaseConfigured) {
        const organizationId = await createSupabaseOrganization(input)
        await refreshWorkspace()
        toast.success("Organización creada")
        return {
          created_at: new Date().toISOString(),
          created_by: user.id,
          id: organizationId,
          industry: input.industry,
          monthly_ticket_volume: input.monthly_ticket_volume,
          name: input.name,
          plan: "free" as const,
          slug: input.slug ?? input.name.toLowerCase(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          updated_at: new Date().toISOString(),
        }
      }

      const created = createLocalOrganization(user, input)
      await refreshWorkspace()
      toast.success("Organización creada")
      return created.organization
    },
    [refreshWorkspace, user],
  )

  const loadDemoData = useCallback(async (targetOrganization?: Organization | null) => {
    if (!user) throw new Error("Necesitas iniciar sesión.")
    const demoOrganization = targetOrganization ?? organization
    if (!demoOrganization) throw new Error("Crea una organización antes de cargar datos demo.")

    const currentRole = member?.role
    if (currentRole && currentRole !== "owner" && currentRole !== "admin") {
      throw new Error("Tu rol actual no permite cargar datos demo.")
    }

    if (isSupabaseConfigured) {
      await loadSupabaseDemoData(demoOrganization.id)
      await refreshWorkspace()
      toast.success("Datos demo cargados")
      return
    }

    const demo = loadLocalDemoData(user, demoOrganization)
    setWorkspaceData(demo)
    setOrganization(demo.organizations[0])
    setMember(demo.organization_members[0])
    toast.success("Espacio demo cargado", {
      description: "Tickets, base de conocimiento, auditoría y analítica están listos.",
    })
  }, [member?.role, organization, refreshWorkspace, user])

  const scopedData = useMemo(
    () => organizationData(workspaceData, organization?.id),
    [organization?.id, workspaceData],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      createOrganization,
      data: scopedData,
      dataModeDescription: explainDataMode(),
      loadDemoData,
      loading,
      member,
      organization,
      refreshWorkspace,
      signIn,
      signOut,
      signUp,
      user,
    }),
    [
      createOrganization,
      loadDemoData,
      loading,
      member,
      organization,
      refreshWorkspace,
      scopedData,
      signIn,
      signOut,
      signUp,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}

