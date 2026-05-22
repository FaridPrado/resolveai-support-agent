import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"
import { Button } from "../ui/button"

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? "Activar tema claro" : "Activar tema oscuro"

  return (
    <Button aria-label={label} title={label} variant="outline" size={compact ? "icon" : "md"} onClick={toggleTheme}>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {compact ? null : <span className="hidden sm:inline">{isDark ? "Tema claro" : "Tema oscuro"}</span>}
    </Button>
  )
}
