import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { AppShell } from "./components/layout/AppShell"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage"
import { LoginPage } from "./pages/auth/LoginPage"
import { OnboardingPage } from "./pages/auth/OnboardingPage"
import { SignupPage } from "./pages/auth/SignupPage"
import { AnalyticsPage } from "./pages/app/AnalyticsPage"
import { AuditLogsPage } from "./pages/app/AuditLogsPage"
import { AutomationsPage } from "./pages/app/AutomationsPage"
import { CustomersPage } from "./pages/app/CustomersPage"
import { DashboardPage } from "./pages/app/DashboardPage"
import { DemoWalkthroughPage } from "./pages/app/DemoWalkthroughPage"
import { InboxPage } from "./pages/app/InboxPage"
import { KnowledgeBasePage } from "./pages/app/KnowledgeBasePage"
import { PlaygroundPage } from "./pages/app/PlaygroundPage"
import { SettingsPage } from "./pages/app/SettingsPage"

function RequireAuth() {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Preparando tu espacio de trabajo...
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function RequireOrganization() {
  const { organization } = useAuth()
  return organization ? <Outlet /> : <Navigate to="/onboarding" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<RequireOrganization />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/demo" element={<DemoWalkthroughPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function AppToaster() {
  const { theme } = useTheme()
  return <Toaster richColors position="top-right" closeButton theme={theme} />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <AppToaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
