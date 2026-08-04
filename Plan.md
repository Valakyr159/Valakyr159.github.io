# Plan: Portfolio + Chatbot RAG — Javier Morón

> Reemplaza al `plan.md` original (Junio 2026, autor "Javier Valderrama" — typo heredado de una plantilla).
> Este documento refleja el estado real del proyecto tras migrar el prototipo más avanzado
> (`Documents/Antigravity/Web Personal`) al repo publicado.

## Estado

✅ Publicado en **https://valakyr159.github.io**
✅ Backend desplegado en Render: **https://personalwebsite-backend-kc07.onrender.com** (`/health` → 200)
✅ CI (build + tests + Lighthouse + e2e) y CD (deploy automático) en GitHub Actions, en ambos repos
✅ 27 tests de frontend (Vitest), 18 de backend (pytest), 4 e2e (Playwright)
⬜ Contenido real de "Proyectos" (integrar apps construidas junto con Claude) — deliberadamente
   pospuesto, ver [Roadmap](#roadmap-pendiente-después-del-lanzamiento)

## Arquitectura

```
Valakyr159/Valakyr159.github.io        (este repo)
  Angular 21 SPA, standalone components, lazy routes
  Home ("/"), Projects ("/projects"), Chatbot ("/chatbot")
  Contenido dirigido por src/app/core/data/cv-data.ts (fuente única de verdad)
  Bilingüe ES/EN vía I18nService, dark mode vía ThemeService
  → angular-cli-ghpages → rama gh-pages → https://valakyr159.github.io

PersonalWebsite-backend (repo hermano, local en ../PersonalWebsite-backend)
  Starlette + SDK `mcp` — servidor MCP sobre SSE (no REST, no streaming token a token)
  Tools expuestos: upload_pdf, query_rag, clear_session
  Embeddings: sentence-transformers (all-MiniLM-L6-v2) en memoria por sesión
  LLM: Groq (llama-3.1-8b-instant)
  → Render (Docker, plan free, vía render.yaml) → https://personalwebsite-backend.onrender.com
```

Por qué dos repos separados: cada uno se despliega a una plataforma distinta con su propio mecanismo
(angular-cli-ghpages vs. Render) — mantenerlos separados evita que un pipeline interfiera con el otro.

Por qué Render y no Hugging Face Spaces (como se planeó originalmente): el plan gratis de HF dejó de
incluir los SDKs Docker/Gradio (solo Static, que no puede correr un backend Python) — Render sí ofrece
Docker gratis sin tarjeta de crédito.

Por qué MCP y no REST+streaming (decisión explícita, difiere del plan original): la implementación
MCP ya funcionaba end-to-end cuando se encontró el proyecto; reescribir a REST hubiera significado
descartar trabajo funcional por fidelidad a un documento de planificación desactualizado.

## Fases

### Fase 0 — Migración del código real ✅
Se reemplazó el scaffold vacío de Angular CLI por el prototipo de `Documents/Antigravity/Web Personal`
(Home con hero animado, About, Skills, Experience, Education, Projects; Chatbot RAG). Bugs corregidos
durante la migración:
- `app.component.html` huérfano (placeholder de Angular CLI sin usar) — eliminado.
- Botón de descarga de CV apuntaba a `assets/cv.pdf` (no existía) — ahora `public/cv.pdf` con href `/cv.pdf`.
- `McpClientService` tenía la URL del backend hardcodeada a `localhost:8000` — ahora lee `environment.apiUrl`.
- Faltaba `fileReplacements` en `angular.json` — el build de producción usaba `environment.ts` (dev) en vez
  de `environment.prod.ts` sin que nadie lo notara.

### Fase 1 — Dominio raíz ✅
`valakyr159.github.io` ya existía como repo desde 2024 (portfolio Angular 18 obsoleto, con Pages activo).
Se renombró a `valakyr159-portfolio-2024-archive` para liberar el nombre, y este repo
(`PersonalWebsite` → `Valakyr159.github.io`) tomó su lugar. `ng deploy` ya no necesita `--base-href`
(el default `/` es correcto en la raíz del dominio).

### Fase 2 — Backend en Render ✅
Desplegado en **https://personalwebsite-backend-kc07.onrender.com** (Blueprint sobre `render.yaml`,
[`Valakyr159/PersonalWebsite-backend`](https://github.com/Valakyr159/PersonalWebsite-backend)). El
primer deploy falló dos veces seguidas antes de quedar arriba — ambos incidentes documentados en el
`CLAUDE.md` del backend, resumen aquí porque son relevantes para cualquier cambio futuro de dependencias:

1. **OOM ("Ran out of memory, used over 512MB")**: `sentence-transformers` arrastra PyTorch, que por sí
   solo ya excede el límite del free tier de Render antes de procesar un solo request. Se reemplazó por
   `fastembed` (ONNX Runtime, sin PyTorch, modelo `BAAI/bge-small-en-v1.5`, `threads=1` para no dejar que
   onnxruntime dimensione su arena de memoria según los cores del host). Pico de memoria medido tras un
   embed real: ~340MB.
2. **`AttributeError` en el import de `server.py`**: el requirement `mcp[cli]>=1.0.0` (sin techo) resolvió
   a `mcp` 2.0.0 en el build de Render, que eliminó los decoradores `@app.list_tools()`/`@app.call_tool()`
   sobre los que está escrito este backend. Se pineó a `mcp[cli]>=1.29.0,<2.0.0` (última línea 1.x) y se
   añadió `tests/test_server.py`, que importa `server.py` de verdad — ningún otro test lo hacía, así que
   este tipo de rotura era invisible para CI.

CORS restringido vía `ALLOWED_ORIGINS`, ruta `/health`, límite de tamaño de PDF vía `MAX_PDF_SIZE_MB`.
Cada push a `main` en el repo del backend redespliega solo — Render vigila el repo directamente (a
diferencia de Hugging Face Spaces, que se descartó porque su plan gratis ya no incluye Docker).

### Fase 3 — CI/CD ✅
- `.github/workflows/ci.yml` (este repo): build + `ng test` + Lighthouse CI + Playwright e2e en cada PR/push.
- `.github/workflows/deploy.yml`: build + `angular-cli-ghpages` automático en cada push a `main`.
- `.github/workflows/ci.yml` (backend): `pytest` en cada PR/push.
- El deploy del backend es automático **una vez conectado** el Blueprint en el dashboard de Render
  (Fase 2, paso 1) — Render vigila el repo directamente, no pasa por GitHub Actions.

### Fase 4 — Pruebas ✅
- **Frontend** (`npx ng test`, Vitest): `theme.service`, `i18n.service`, `footer.component`,
  `navbar.component`, `project-card.component`, `mcp-client.service` (con el SDK de MCP mockeado,
  verifica específicamente que ya no usa la URL hardcodeada).
- **Backend** (`pytest`, repo hermano): `pdf_tools` (extracción real con PyMuPDF sobre un PDF generado
  en memoria, chunking), `session_manager` (TTL, cosine similarity con un embedder falso determinístico
  para no depender de red/GPU en CI), `rag_tools` (Groq mockeado, nunca pega a la API real en tests).
- **E2E** (`npx playwright test`): home carga con nav y hero, navegación a `/projects` renderiza tarjetas,
  `/chatbot` muestra el badge de conexión, el toggle de dark mode cambia la clase del `<html>`.

### Fase 5 — Métricas ✅
- **Lighthouse CI** (`lighthouserc.json`): Performance ≥ 0.90 (warn), Accessibility ≥ 0.90 (error),
  Best Practices y SEO ≥ 0.90 (warn). Verificado localmente contra el build de producción:
  Performance 0.95, Accessibility 1.0, Best Practices 1.0, SEO 1.0.
- **Presupuestos de bundle** (`angular.json`): 500kB warning / 1MB error en el bundle inicial;
  4kB/8kB por estilos de componente. El chunk del chatbot (lazy, ~457kB) no cuenta contra el inicial.
- **Backend** (checklist manual post-deploy, no automatizado — depende del servicio real en Render):
  - PDF de 50 páginas procesado en < 30s
  - Cold start (free tier de Render duerme tras ~15 min de inactividad) ≈ 30-60s — limitación conocida
    del hosting gratuito, no algo que se "arregle"; si molesta, considerar un ping periódico desde el
    frontend cuando el usuario esté en `/chatbot`.
  - `GET /health` responde 200 con el conteo de sesiones activas.

### Fase 6 — Documentación y agentes ✅
Este archivo, `CLAUDE.md` (en ambos repos) y los subagentes en `.claude/agents/` — ver esa carpeta.

## Roadmap (pendiente, después del lanzamiento)

Por pedido explícito: la sección "Proyectos" hoy solo tiene el propio Chatbot RAG
(`cv-data.ts` → `projects`). Cuando retomemos:
- Integrar como tarjetas de proyecto reales las apps ya construidas junto con Claude (revisar
  historial de trabajo/repos existentes en la cuenta de GitHub del usuario).
- Añadir capturas/demos donde aplique.
- Revisar si alguna de esas apps amerita su propia página de detalle en vez de solo una tarjeta.

Roadmap original (heredado del plan.md previo, sigue siendo válido como ideas futuras, no comprometido):
generador de CV con AI, bot de code review sobre PRs de GitHub, traductor de documentación técnica,
dashboard de métricas personales.
