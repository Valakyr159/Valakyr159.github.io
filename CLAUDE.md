# CLAUDE.md

Guía para trabajar en este repo con Claude Code. Ver también [`Plan.md`](./Plan.md) para el estado
completo del proyecto y las fases pendientes.

## Qué es esto

Portfolio personal de Javier Morón: Angular 21 SPA publicada en https://valakyr159.github.io, con un
chatbot RAG (sube un PDF, pregúntale) como proyecto destacado. El backend del chatbot vive en un repo
hermano (`../PersonalWebsite-backend`) y se despliega por separado a Render.

## Stack

- Angular 21, standalone components, rutas lazy-loaded (`src/app/app.routes.ts`)
- Tailwind CSS **v3** (no v4 — la integración nativa de Tailwind de Angular CLI + este
  `tailwind.config.js` estilo v3 no son compatibles con Tailwind v4; si algo empuja a instalar v4,
  el build se rompe con un error de PostCSS. Quedarse en `tailwindcss@^3`)
- Vitest (vía el builder nativo `@angular/build:unit-test`, no Karma)
- Playwright para e2e
- `@modelcontextprotocol/sdk` en el cliente del chatbot (no es un chat REST normal, es MCP sobre SSE)

## Estructura

```
src/app/
  core/
    data/cv-data.ts        ← fuente única de verdad para todo el contenido (nombre, bio, skills,
                              experiencia, educación, proyectos). Cambiar contenido = editar este archivo.
    services/
      theme.service.ts     ← dark/light mode, signal-based, persistido en localStorage
      i18n.service.ts      ← diccionarios ES/EN completos, signal-based (i18n.t() en templates)
  shared/components/       ← navbar, footer (usados en app.component.ts vía template inline)
  pages/
    home/                  ← hero, hero-canvas (animación en canvas), about, skills, experience,
                              education, projects-preview — todos dirigidos por cv-data.ts
    projects/               ← grid filtrable de project-card
    chatbot/
      chatbot.component.ts
      services/mcp-client.service.ts  ← cliente MCP real, conecta a `${environment.apiUrl}/sse`
      components/pdf-dropzone, message-bubble
```

## Comandos

```bash
npm install
npx ng serve                          # dev server, localhost:4200
npx ng build --configuration production
npx ng test                           # Vitest, corre una vez (no watch)
npx playwright test                   # e2e, necesita el build de producción servido (ver playwright.config.ts)
npx ng deploy                         # build + push a gh-pages (usa angular-cli-ghpages, no necesita --base-href)
```

CI (`.github/workflows/ci.yml`) corre build + test + Lighthouse CI + e2e en cada PR/push.
`.github/workflows/deploy.yml` despliega automáticamente en cada push a `main`.

## El chatbot es MCP, no REST

`McpClientService` (`src/app/pages/chatbot/services/mcp-client.service.ts`) usa
`@modelcontextprotocol/sdk`'s `Client` + `SSEClientTransport` conectando a `${environment.apiUrl}/sse`.
Los "endpoints" son tools MCP (`upload_pdf`, `query_rag`, `clear_session`), no rutas REST. Las respuestas
del backend **no** hacen streaming token a token — llegan completas de una vez (limitación conocida,
documentada en `Plan.md`, no un bug).

`environment.apiUrl` (`src/environments/`) apunta a `localhost:8000` en dev y a la URL del servicio de
Render en producción (`environment.prod.ts` — placeholder hasta que el servicio exista, ver `Plan.md`
Fase 2). El swap dev→prod ocurre vía `fileReplacements` en `angular.json`, no automáticamente.

## Backend

Vive en `../PersonalWebsite-backend` (repo separado, no un submódulo). Ver el `CLAUDE.md` de ese repo.
Se despliega en Render a partir de `render.yaml` (Blueprint) — una vez conectado el repo en el dashboard
de Render, cada push a `main` en el backend redespliega solo, sin pasar por GitHub Actions.

## Gotchas conocidos

- No subir `tailwindcss` a v4 sin también migrar `tailwind.config.js` y `postcss.config.cjs` al nuevo
  formato — ya rompió el build una vez en este proyecto.
- `public/cv.pdf` es el CV real, referenciado desde `hero.component.ts` con href absoluto `/cv.pdf`
  (no relativo — con rutas relativas el link se rompe en subrutas como `/projects`).
- `.claude/` está en `.gitignore` — es configuración local del harness, no se commitea.
