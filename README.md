# ResolveAI Support Agent

Agente de soporte al cliente con inteligencia artificial, aprobación humana, base de conocimiento, analítica operativa y arquitectura multi-tenant sobre Supabase.

![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres%20%2B%20RLS-3ecf8e)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Status](https://img.shields.io/badge/status-MVP%20técnico-brightgreen)

## Demo

- **Aplicación web:** https://resolveai-support-agent.vercel.app
- **Repositorio:** https://github.com/FaridPrado/resolveai-support-agent
- **Modo demo local:** disponible sin configurar Supabase.
- **Usuario demo sugerido:** `demo@resolveai.local`
- **Contraseña demo sugerida:** `demo-password`

## Sobre el proyecto

**ResolveAI Support Agent** es un SaaS B2B para equipos de soporte que necesitan responder tickets con mayor velocidad, mantener control humano sobre las respuestas generadas por IA y medir el impacto operativo del uso de agentes.

El proyecto simula una plataforma real de atención al cliente: permite crear una organización, cargar datos demo, revisar una bandeja de tickets, consultar una base de conocimiento, visualizar borradores generados por IA, analizar métricas de productividad, revisar logs de auditoría y demostrar un flujo comercial completo mediante una demo guiada.

La intención no es construir un chatbot genérico, sino una base técnica para un **AI Support Copilot** con arquitectura multi-tenant, roles, seguridad por organización, datos demo realistas y una experiencia visual lista para presentar a clientes o reclutadores.

## Objetivo

El objetivo principal es demostrar cómo un agente de IA puede integrarse en un flujo empresarial de soporte sin perder trazabilidad, seguridad ni supervisión humana.

El proyecto aborda problemas comunes en operaciones de soporte:

- alto volumen de tickets repetitivos;
- tiempos de respuesta lentos;
- respuestas inconsistentes entre agentes;
- falta de visibilidad sobre temas recurrentes;
- conocimiento interno disperso;
- riesgo de que la IA invente respuestas o prometa acciones no autorizadas;
- ausencia de auditoría sobre decisiones asistidas por IA;
- dificultad para demostrar ROI en iniciativas de automatización.

Para resolverlo, el sistema combina interfaz SaaS, autenticación, organizaciones, roles, datos multi-tenant, RLS en Supabase, base de conocimiento, borradores IA simulados, analítica, auditoría y un modo demo funcional.

## Qué hace

El flujo principal del producto es:

1. El usuario crea una cuenta o inicia sesión.
2. Crea una organización con industria y volumen estimado de tickets.
3. Carga datos demo de soporte.
4. Revisa métricas en el dashboard.
5. Abre la bandeja de tickets.
6. Selecciona un caso de cliente.
7. Consulta resumen, prioridad, sentimiento, categoría y confianza IA.
8. Revisa una respuesta sugerida por el copiloto.
9. Identifica fuentes usadas y banderas de riesgo.
10. Edita o aprueba un envío simulado.
11. Consulta artículos de la base de conocimiento.
12. Prueba recuperación de conocimiento desde una pregunta.
13. Revisa automatizaciones, clientes, analítica y auditoría.
14. Usa la demo guiada para presentar el valor del producto en pocos minutos.

## Caso de uso: soporte al cliente asistido por IA

ResolveAI está pensado para empresas que reciben tickets por canales como email, chat, formularios web, WhatsApp o integraciones API.

Cada ticket puede contener:

- cliente asociado;
- canal de entrada;
- prioridad;
- sentimiento;
- intención;
- categoría;
- resumen generado por IA;
- acción recomendada;
- SLA estimado;
- borrador de respuesta;
- fuentes de conocimiento relacionadas;
- flags de riesgo;
- eventos de auditoría.

El caso de uso permite demostrar una arquitectura realista para vender o extender hacia integraciones con Zendesk, Intercom, Gmail, Slack, WhatsApp o webhooks personalizados.

## Capturas

Las capturas del producto están en la carpeta `artifacts/`.

```text
artifacts/
├── resolveai-dashboard.png
├── resolveai-dashboard-es.png
├── resolveai-dashboard-mobile.png
├── resolveai-hardening-desktop.png
├── resolveai-hardening-mobile.png
└── resolveai-inbox-es.png
```

Ejemplos:

![Dashboard](artifacts/resolveai-dashboard-es.png)

![Inbox](artifacts/resolveai-inbox-es.png)

## Arquitectura

```mermaid
flowchart TD
    A[Usuario] --> B[React + TypeScript]
    B --> C[Auth Provider]
    C --> D{¿Supabase configurado?}
    D -- No --> E[Modo mock localStorage]
    D -- Sí --> F[Supabase Auth]
    F --> G[Supabase Postgres]
    G --> H[RLS por organization_id]
    G --> I[RPC create_organization_with_owner]
    G --> J[RPC load_demo_data]
    B --> K[App Shell]
    K --> L[Dashboard]
    K --> M[Inbox]
    K --> N[Knowledge Base]
    K --> O[AI Playground]
    K --> P[Automations]
    K --> Q[Analytics]
    K --> R[Customers]
    K --> S[Audit Logs]
    K --> T[Settings]
    M --> U[AI Drafts simulados]
    N --> V[Knowledge Sources + Chunks]
    Q --> W[ROI y métricas]
    S --> X[Trazabilidad]
```

## Arquitectura de datos

El proyecto usa un modelo multi-tenant donde la mayoría de entidades pertenecen a una organización mediante `organization_id`.

Tablas principales incluidas en la migración:

- `organizations`
- `organization_members`
- `customers`
- `tickets`
- `ticket_messages`
- `ai_drafts`
- `knowledge_sources`
- `knowledge_chunks`
- `automation_rules`
- `audit_logs`
- `agent_feedback`
- `integration_connections`
- `analytics_events`

También incluye:

- enums para planes, roles, estados, canales, prioridades, sentimientos y proveedores de integración;
- índices por organización, tickets, prioridad, estado, fechas y entidades relacionadas;
- triggers de `updated_at`;
- funciones helper `is_org_member` y `has_org_role`;
- función RPC `create_organization_with_owner`;
- función RPC `load_demo_data`;
- bucket privado `knowledge-documents`;
- políticas de Storage para lectura por miembros y escritura por owners/admins.

## Seguridad y multi-tenancy

El proyecto incluye una base de seguridad pensada para un SaaS B2B:

- autenticación con Supabase Auth cuando hay variables configuradas;
- modo mock local cuando Supabase no está configurado;
- separación lógica por `organization_id`;
- Row Level Security habilitado en las tablas principales;
- políticas de lectura solo para miembros activos de la organización;
- escritura sensible restringida mediante RPC o futuras Edge Functions;
- revocación de inserts, updates y deletes directos desde clientes autenticados en tablas críticas;
- roles `owner`, `admin`, `agent` y `viewer`;
- permisos de UI basados en rol;
- auditoría para eventos relevantes;
- bucket privado para documentos de conocimiento;
- variables sensibles documentadas como secretos del lado servidor, no como variables frontend.

> Nota: el MVP actual documenta y prepara la arquitectura para Edge Functions, IA real y webhooks firmados. La versión incluida en este repositorio funciona principalmente con UI, modo mock, Supabase schema, RPCs y datos demo. Las llamadas reales a modelos de IA deben implementarse del lado servidor antes de producción.

## Módulos principales

### `src/App.tsx`

Define las rutas principales de la aplicación.

Responsabilidades:

- proteger rutas autenticadas;
- exigir organización antes de entrar a la app;
- registrar rutas de auth;
- registrar rutas internas del dashboard;
- envolver la app con proveedores globales;
- mostrar notificaciones con `sonner`.

### `src/contexts/AuthContext.tsx`

Centraliza autenticación, sesión, organización actual y datos del workspace.

Incluye:

- login;
- signup;
- logout;
- creación de organización;
- carga de datos demo;
- lectura desde Supabase cuando está configurado;
- fallback a modo mock con `localStorage`.

### `src/services/workspaceStore.ts`

Contiene la capa de acceso a datos del workspace.

Responsabilidades:

- crear usuarios locales en modo mock;
- crear organizaciones locales;
- persistir sesión local;
- cargar datos demo;
- consultar Supabase;
- llamar RPCs;
- normalizar errores seguros para la UI.

### `src/data/demoData.ts`

Genera un workspace demo completo.

Incluye:

- organización;
- miembro owner;
- clientes;
- tickets;
- mensajes;
- artículos de conocimiento;
- chunks;
- borradores IA;
- reglas de automatización;
- conexiones de integración;
- eventos analíticos;
- logs de auditoría.

### `src/types/domain.ts`

Define los tipos principales del dominio.

Incluye modelos para:

- organizaciones;
- miembros;
- clientes;
- tickets;
- mensajes;
- borradores IA;
- base de conocimiento;
- automatizaciones;
- auditoría;
- integraciones;
- métricas.

### `src/lib/analytics.ts`

Calcula métricas y datos para gráficos.

Incluye:

- tickets abiertos;
- tickets urgentes;
- borradores generados;
- tickets clasificados;
- tiempo estimado ahorrado;
- confianza promedio;
- temas recurrentes;
- brechas de conocimiento;
- ahorro mensual estimado.

### `src/lib/permissions.ts`

Define permisos por rol.

Reglas principales:

- `owner`: puede administrar workspace, miembros, conocimiento, automatizaciones y tickets.
- `admin`: puede administrar workspace, conocimiento, automatizaciones y tickets.
- `agent`: puede responder tickets.
- `viewer`: solo lectura.

### `src/pages/app/DashboardPage.tsx`

Panel principal de métricas.

Muestra:

- tickets abiertos;
- tickets urgentes;
- borradores IA;
- tiempo estimado ahorrado;
- confianza promedio;
- brechas de conocimiento;
- volumen de tickets;
- distribución por categoría;
- distribución de sentimiento;
- prioridades del día;
- recomendaciones de IA;
- cálculo visual de ROI.

### `src/pages/app/InboxPage.tsx`

Bandeja de tickets.

Incluye:

- lista de tickets;
- detalle de conversación;
- perfil del cliente;
- badges de prioridad, sentimiento y confianza;
- panel de copiloto IA;
- resumen del caso;
- respuesta sugerida;
- risk flags;
- acción recomendada;
- controles de edición y envío simulado.

### `src/pages/app/KnowledgeBasePage.tsx`

Base de conocimiento.

Incluye:

- listado de fuentes;
- estado de ingesta;
- tags;
- conteo de artículos, fuentes activas, fallos y chunks;
- búsqueda textual en modo mock;
- mensaje de escalamiento cuando no hay evidencia suficiente.

### `src/pages/app/PlaygroundPage.tsx`

Espacio para probar respuestas del agente.

Permite experimentar con:

- tickets demo;
- tono de respuesta;
- instrucciones adicionales;
- confianza;
- fuentes;
- flags de riesgo;
- acción recomendada.

### `src/pages/app/DemoWalkthroughPage.tsx`

Demo guiada para presentar el producto.

Muestra un flujo comercial con:

- ticket urgente;
- clasificación automática;
- resumen IA;
- fuentes;
- edición humana;
- envío simulado;
- auditoría;
- métricas de impacto;
- recomendación de mejora de conocimiento.

### `src/pages/app/AnalyticsPage.tsx`

Analítica operativa.

Muestra métricas de soporte, tendencias, impacto estimado y señales para priorizar mejoras.

### `src/pages/app/AuditLogsPage.tsx`

Registro de auditoría.

Permite revisar eventos del sistema, acciones de usuario, acciones de IA y trazabilidad operativa.

### `src/pages/app/SettingsPage.tsx`

Configuración del workspace.

Incluye secciones para:

- organización;
- miembros;
- AI settings;
- seguridad;
- integraciones;
- billing visual.

### `supabase/migrations/20260522150000_initial_schema.sql`

Migración principal de Supabase.

Incluye:

- schema multi-tenant;
- enums;
- tablas;
- índices;
- triggers;
- helper functions;
- RLS;
- policies;
- grants;
- bucket de Storage;
- RPCs para organización y datos demo.

## Agente de soporte

El agente del MVP está representado por datos demo, UI de copiloto y estructura preparada para IA real.

### 1. Clasificador de tickets

Representado en el modelo de datos por:

- `priority`;
- `sentiment`;
- `intent`;
- `category`;
- `language`;
- `ai_confidence`;
- `ai_summary`;
- `ai_recommended_action`.

En producción, esta responsabilidad debería pasar a una Edge Function como `classify-ticket`.

### 2. Generador de borradores

Representado por la tabla `ai_drafts` y el panel de copiloto.

Cada borrador contiene:

- texto sugerido;
- tono;
- confianza;
- fuentes citadas;
- flags de riesgo;
- modelo usado;
- versión de prompt;
- estado del borrador.

En producción, esta responsabilidad debería pasar a una Edge Function como `generate-ai-draft`.

### 3. Recuperación de conocimiento

Representada por:

- `knowledge_sources`;
- `knowledge_chunks`;
- búsqueda textual en la UI;
- estructura preparada para embeddings mediante `embedding_json`.

En producción, esta responsabilidad debería evolucionar hacia búsqueda semántica con pgvector o un servicio vectorial externo.

### 4. Supervisión humana

El producto está diseñado para que la IA no responda automáticamente.

El agente humano debe poder:

- revisar el resumen;
- leer la respuesta sugerida;
- verificar fuentes;
- detectar flags de riesgo;
- editar el texto;
- aprobar un envío simulado;
- escalar casos sensibles.

## Control de calidad

El proyecto incluye varias capas para mejorar confiabilidad:

- TypeScript estricto para el dominio;
- rutas protegidas por autenticación;
- separación entre auth, datos, UI y métricas;
- permisos por rol;
- estados vacíos para datos inexistentes;
- toasts de éxito/error;
- manejo seguro de errores;
- fallback mock sin depender de servicios externos;
- RLS en Supabase;
- lectura de datos filtrada por organización;
- auditoría como entidad de primer nivel;
- UI responsive con sidebar móvil;
- modo claro/oscuro mediante `ThemeContext`;
- datos demo suficientemente ricos para probar el producto completo.

## Estructura del proyecto

```text
resolveai-support-agent/
├── artifacts/
│   ├── resolveai-dashboard-es.png
│   ├── resolveai-dashboard-mobile.png
│   ├── resolveai-dashboard.png
│   ├── resolveai-hardening-desktop.png
│   ├── resolveai-hardening-mobile.png
│   └── resolveai-inbox-es.png
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.tsx
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── app/
│   │   ├── brand/
│   │   ├── layout/
│   │   ├── states/
│   │   ├── theme/
│   │   └── ui/
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── data/
│   │   └── demoData.ts
│   ├── lib/
│   │   ├── analytics.ts
│   │   ├── labels.ts
│   │   ├── permissions.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── app/
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── AuditLogsPage.tsx
│   │   │   ├── AutomationsPage.tsx
│   │   │   ├── CustomersPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DemoWalkthroughPage.tsx
│   │   │   ├── InboxPage.tsx
│   │   │   ├── KnowledgeBasePage.tsx
│   │   │   ├── PlaygroundPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   └── auth/
│   │       ├── AuthLayout.tsx
│   │       ├── ForgotPasswordPage.tsx
│   │       ├── LoginPage.tsx
│   │       ├── OnboardingPage.tsx
│   │       └── SignupPage.tsx
│   ├── services/
│   │   └── workspaceStore.ts
│   ├── types/
│   │   └── domain.ts
│   ├── index.css
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   └── 20260522150000_initial_schema.sql
│   └── seed.sql
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Tecnologías

- **React 19**: construcción de la interfaz.
- **TypeScript 6**: tipado del dominio y seguridad en desarrollo.
- **Vite 8**: entorno de desarrollo y build.
- **Tailwind CSS 4**: estilos utilitarios.
- **Supabase JS**: autenticación y consultas a Postgres.
- **Supabase Auth**: login, signup y sesión.
- **Supabase Postgres**: persistencia multi-tenant.
- **Supabase RLS**: aislamiento por organización.
- **Supabase Storage**: bucket privado para documentos de conocimiento.
- **React Router**: rutas públicas y privadas.
- **Recharts**: visualización de métricas.
- **Lucide React**: iconografía.
- **Sonner**: notificaciones.
- **Zod + React Hook Form**: base para validación de formularios.
- **ESLint**: revisión estática.

## Instalación local

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd resolveai-support-agent
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

Por defecto, si no configuras Supabase, la aplicación funciona en **modo mock** usando `localStorage`.

### 4. Entrar en modo demo

Puedes usar cualquier email y contraseña en modo mock. Para mantener consistencia en demos:

```text
Email: demo@resolveai.local
Contraseña: demo-password
```

Después:

1. crea una organización;
2. deja activa la opción de cargar datos demo;
3. entra al dashboard;
4. abre la bandeja;
5. revisa la demo guiada.

## Configuración con Supabase

### 1. Crear archivo de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### 2. Configurar variables frontend

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Estas variables son públicas por diseño en aplicaciones frontend con Supabase. No agregues claves privadas aquí.

### 3. Aplicar migración SQL

Ejecuta el contenido de:

```text
supabase/migrations/20260522150000_initial_schema.sql
```

Puedes aplicarlo desde:

- SQL Editor de Supabase;
- Supabase CLI;
- pipeline de migraciones del proyecto.

### 4. Variables sensibles del lado servidor

Las siguientes claves no deben vivir en el frontend:

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
WEBHOOK_SIGNING_SECRET=
```

Guárdalas como secretos de Supabase o del proveedor donde ejecutes Edge Functions.

## Scripts disponibles

### Desarrollo

```bash
npm run dev
```

Inicia Vite en modo desarrollo.

### Build

```bash
npm run build
```

Ejecuta TypeScript y genera build de producción.

### Lint

```bash
npm run lint
```

Ejecuta ESLint sobre el proyecto.

### Preview

```bash
npm run preview
```

Sirve localmente el build generado.

## Verificación técnica

Comandos recomendados antes de subir cambios:

```bash
npm run lint
npm run build
```

Durante la revisión de este paquete se verificó:

```bash
npx tsc -b
npm run lint
```

Ambos pasaron después de ajustar permisos de ejecución dentro del `node_modules` incluido en el ZIP.

> Nota: el build completo con Vite puede fallar si el ZIP trae un `node_modules` generado en otro entorno y falta el binding nativo opcional de `rolldown`. En ese caso, elimina dependencias instaladas y reinstala:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

Si prefieres conservar `package-lock.json`, usa:

```bash
rm -rf node_modules
npm install
npm run build
```

## Modo mock

El modo mock permite probar el producto sin Supabase.

Características:

- sesión local con `localStorage`;
- creación local de organización;
- carga de workspace demo;
- tickets, clientes, conocimiento, auditoría y analítica generados en memoria local;
- experiencia de demo completa sin APIs externas.

Este modo es ideal para:

- demos comerciales;
- pruebas rápidas;
- grabar videos;
- revisar UI;
- enseñar el caso de uso sin configurar backend.

## Datos demo

El proyecto genera un workspace demo con:

- 1 organización;
- 1 owner;
- clientes B2B;
- tickets de soporte;
- mensajes de clientes y notas internas;
- borradores IA;
- fuentes de conocimiento;
- chunks;
- automatizaciones;
- integraciones simuladas;
- eventos analíticos;
- logs de auditoría.

Casos incluidos:

- cobro duplicado;
- problema de login;
- política de reembolso;
- bug report;
- cancelación;
- integración API;
- facturación enterprise;
- solicitud de feature;
- cliente que pide humano;
- intento de prompt injection.

## Analítica y ROI

La app calcula métricas operativas para vender el valor del agente:

- tickets abiertos;
- tickets urgentes;
- borradores IA generados;
- tickets clasificados;
- confianza promedio;
- temas repetitivos;
- brechas de conocimiento;
- tiempo estimado ahorrado;
- ahorro mensual potencial.

Fórmula usada:

```text
tiempo_ahorrado = borradores_ia * 4 minutos + tickets_clasificados * 1 minuto
ahorro_mensual = (tiempo_ahorrado / 60) * costo_hora_soporte * 4
```

El costo por hora se toma de la organización y usa `25 USD/hora` como valor por defecto.

## Decisiones técnicas

### Multi-tenancy desde el inicio

Todas las entidades importantes se relacionan con una organización. Esto permite escalar el producto hacia múltiples clientes sin rediseñar el modelo de datos.

### RLS como capa central de seguridad

La base de datos no depende únicamente de validaciones frontend. Las políticas de Supabase restringen lectura por membresía activa y reservan mutaciones sensibles para RPCs o futuras Edge Functions.

### Modo mock para demostración

El proyecto puede ejecutarse sin servicios externos. Esto reduce fricción al mostrarlo en GitHub, entrevistas, demos o pruebas locales.

### Human-in-the-loop

La IA no envía respuestas automáticamente. El diseño prioriza revisión humana, flags de riesgo, fuentes y auditoría.

### Borradores en lugar de respuestas finales

La entidad `ai_drafts` permite guardar, revisar, editar, aprobar o rechazar sugerencias antes de que se conviertan en mensajes.

### Knowledge base separada en sources y chunks

La separación permite evolucionar hacia recuperación semántica, embeddings, pgvector o integración con documentación externa.

### Auditoría como producto, no como extra

El registro de auditoría permite mostrar responsabilidad operativa: qué ocurrió, quién actuó, sobre qué entidad y cuándo.

## Estado actual

Implementado:

- frontend React + TypeScript;
- diseño SaaS responsive;
- autenticación y onboarding;
- modo mock;
- integración base con Supabase;
- schema multi-tenant;
- RLS y policies;
- RPC para crear organización;
- RPC para cargar datos demo;
- dashboard;
- inbox;
- knowledge base;
- AI playground;
- automations;
- analytics;
- customers;
- audit logs;
- settings;
- demo walkthrough;
- dark mode;
- datos demo realistas.

Pendiente para producción:

- Edge Functions reales para IA;
- conexión a OpenAI o Anthropic desde backend;
- generación real de embeddings;
- búsqueda semántica con pgvector;
- webhooks firmados;
- envío real de email o integración con helpdesk;
- pruebas automatizadas;
- CI/CD;
- rate limiting server-side;
- hardening adicional de Content Security Policy;
- pantalla de administración avanzada de miembros;
- billing real.

## Roadmap sugerido

- Implementar `generate-ai-draft` como Supabase Edge Function.
- Implementar `classify-ticket` como Edge Function.
- Implementar `ingest-knowledge` con extracción de texto y chunking.
- Agregar pgvector para embeddings.
- Implementar `search-knowledge` con búsqueda semántica.
- Agregar webhook `webhook-ingest-ticket` con firma HMAC.
- Conectar un proveedor real de email para envío controlado.
- Agregar tests unitarios y E2E.
- Crear pipeline de GitHub Actions.
- Publicar demo en Vercel, Netlify o Supabase Hosting compatible.
- Añadir documentación de threat model.

## Buenas prácticas para GitHub

Antes de subir el proyecto al repositorio:

- no subas `node_modules/`;
- no subas `dist/` si el deploy lo genera automáticamente;
- no subas `.env.local`;
- conserva `.env.example`;
- verifica que `.gitignore` esté activo;
- ejecuta lint y build;
- actualiza los enlaces de demo y repositorio en este README;
- revisa que las capturas en `artifacts/` no contengan datos sensibles.

## Configuración recomendada de deploy

Para un deploy frontend típico:

```bash
npm install
npm run build
```

Directorio de salida:

```text
dist/
```

Variables necesarias en el proveedor de hosting:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Las claves privadas deben configurarse únicamente en el backend donde vivan las Edge Functions.

## Posibles mejoras

- Editor real para knowledge base.
- Creación real de tickets desde la UI.
- Aprobación funcional de envío simulado contra base de datos.
- Historial de cambios entre borrador IA y edición humana.
- Feedback loop para mejorar prompts.
- Panel de seguridad con checks automáticos.
- Importación de artículos desde URL.
- Subida real de PDF y extracción de texto.
- Integración con Zendesk.
- Integración con Intercom.
- Integración con Gmail.
- Exportación CSV de analytics.
- Sistema de invitaciones por email.
- Plantillas de automatización por industria.
- Modo enterprise con SSO y SCIM.

## Autor

**Farid Prado**

Proyecto personal de inteligencia artificial aplicada a agentes, soporte al cliente, automatización operativa, arquitectura SaaS y seguridad multi-tenant.
