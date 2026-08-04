# Plan: Portfolio + Chatbot RAG — Javier Morón

> Reemplaza al `plan.md` original (Junio 2026, autor "Javier Valderrama" — typo heredado de una plantilla).
> Este documento refleja el estado real del proyecto tras migrar el prototipo más avanzado
> (`Documents/Antigravity/Web Personal`) al repo publicado.

## Estado

✅ Publicado en **https://valakyr159.github.io**
✅ Chatbot RAG funcional (arquitectura MCP) — backend listo para desplegar, pendiente de que se cree
   el Space de Hugging Face (requiere tu cuenta, ver Fase 2)
✅ CI (build + tests + Lighthouse + e2e) y CD (deploy automático) en GitHub Actions
✅ 27 tests de frontend (Vitest), 15 de backend (pytest), 4 e2e (Playwright)
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
  → `git push` a un Hugging Face Space (Docker) → https://<space>.hf.space
```

Por qué dos repos separados: cada uno se despliega con un mecanismo de `git push` distinto
(angular-cli-ghpages vs. Hugging Face Spaces) — mantenerlos separados evita que un pipeline
interfiera con el otro.

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

### Fase 2 — Backend en Hugging Face Spaces ⬜ (requiere tu cuenta de HF)
Código listo en `../PersonalWebsite-backend` (también en GitHub como
[`Valakyr159/PersonalWebsite-backend`](https://github.com/Valakyr159/PersonalWebsite-backend), con CI en
verde), con CORS restringido vía `ALLOWED_ORIGINS`,
ruta `/health`, y límite de tamaño de PDF vía `MAX_PDF_SIZE_MB`). Pasos manuales pendientes (no se
pueden automatizar sin tus credenciales de Hugging Face):
1. Crear una cuenta/Space en https://huggingface.co/new-space — tipo **Docker**, hardware CPU básico, público.
2. Añadir el repo remoto del Space y hacer push:
   ```bash
   cd ../PersonalWebsite-backend
   git remote add space https://huggingface.co/spaces/<tu-usuario>/<nombre-space>
   git push space main
   ```
3. En la configuración del Space (pestaña "Settings" → "Repository secrets"), añadir:
   - `GROQ_API_KEY` (consíguela en https://console.groq.com)
   - `ALLOWED_ORIGINS=https://valakyr159.github.io`
4. Una vez el Space esté arriba, actualizar `src/environments/environment.prod.ts` en este repo con la
   URL real (`https://<tu-usuario>-<nombre-space>.hf.space`) y redesplegar (`git push` a `main`, el
   workflow de deploy se encarga solo).

### Fase 3 — CI/CD ✅
- `.github/workflows/ci.yml` (este repo): build + `ng test` + Lighthouse CI + Playwright e2e en cada PR/push.
- `.github/workflows/deploy.yml`: build + `angular-cli-ghpages` automático en cada push a `main`.
- `.github/workflows/ci.yml` (backend): `pytest` en cada PR/push.
- El deploy del backend al Space sigue siendo manual (`git push space main`) — Hugging Face Spaces no
  tiene una integración limpia con GitHub Actions sin exponer el token del Space.

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
- **Backend** (checklist manual post-deploy, no automatizado — depende del Space real):
  - PDF de 50 páginas procesado en < 30s
  - Cold start del Space (free tier duerme tras inactividad) ≈ 30s — limitación conocida del plan
    gratuito de HF Spaces, no algo que se "arregle"; si molesta, considerar un ping periódico desde
    el frontend cuando el usuario esté en `/chatbot`.
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
