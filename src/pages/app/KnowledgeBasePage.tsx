import { BookOpen, FileText, Search, UploadCloud } from "lucide-react"
import { useMemo, useState } from "react"
import { EmptyState } from "../../components/states/EmptyState"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { useAuth } from "../../contexts/AuthContext"
import { knowledgeStatusLabels } from "../../lib/labels"
import { canManageKnowledge, permissionText } from "../../lib/permissions"
import { showSafeError } from "../../services/workspaceStore"

export function KnowledgeBasePage() {
  const { data, loadDemoData, member } = useAuth()
  const [query, setQuery] = useState("política de reembolso cobro duplicado")
  const canManage = canManageKnowledge(member?.role)
  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    return data.knowledge_sources
      .map((source) => {
        const haystack = `${source.title} ${source.content} ${(source.tags ?? []).join(" ")}`.toLowerCase()
        const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0)
        return { score, source }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
  }, [data.knowledge_sources, query])

  if (!data.knowledge_sources.length) {
    return (
      <EmptyState
        action={() => loadDemoData().catch(showSafeError)}
        actionLabel="Cargar conocimiento demo"
        description="El conocimiento demo incluye reembolsos, restablecimiento de contraseña, facturación, cancelación, API, escalamiento y seguridad."
        disabled={!canManage}
        icon={<BookOpen className="h-10 w-10" />}
        title={canManage ? "Aún no hay fuentes de conocimiento" : "Sin fuentes disponibles para tu rol"}
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Artículos totales", data.knowledge_sources.length],
          ["Fuentes activas", data.knowledge_sources.filter((source) => source.status === "active").length],
          ["Ingestas fallidas", data.knowledge_sources.filter((source) => source.status === "failed").length],
          ["Chunks generados", data.knowledge_chunks.length],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-5">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Fuentes de conocimiento</CardTitle>
              <CardDescription>Los artículos están aislados por organización y listos para ingesta.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button disabled={!canManage} title={!canManage ? permissionText("subir documentos") : undefined} variant="outline">
                <UploadCloud className="h-4 w-4" />
                Subir documento
              </Button>
              <Button disabled={!canManage} title={!canManage ? permissionText("crear artículos") : undefined}>
                <FileText className="h-4 w-4" />
                Nuevo artículo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.knowledge_sources.map((source) => (
              <article key={source.id} className="rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">{source.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{source.content}</p>
                  </div>
                  <Badge tone={source.status === "active" ? "emerald" : source.status === "failed" ? "rose" : "amber"}>
                    {knowledgeStatusLabels[source.status]}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(source.tags ?? []).map((tag) => <Badge key={tag} tone="gray">{tag}</Badge>)}
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Probar búsqueda</CardTitle>
            <CardDescription>Búsqueda textual en modo mock; el SQL queda preparado para búsqueda semántica con embeddings.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="relative block">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <div className="mt-4 space-y-3">
              {results.map(({ score, source }) => (
                <div key={source.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{source.title}</p>
                  <Badge tone={score >= 2 ? "emerald" : "amber"}>{Math.min(95, 55 + score * 15)}% coincidencia</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{source.content.slice(0, 180)}...</p>
                </div>
              ))}
              {!results.length ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  No se encontró evidencia suficiente. El agente debe pedir aclaración o escalar a una persona.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

