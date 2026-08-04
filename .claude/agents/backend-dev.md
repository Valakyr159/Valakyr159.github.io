---
name: backend-dev
description: Trabaja en el servidor MCP del chatbot RAG (session_manager, rag_tools, pdf_tools, server.py). Úsalo para cambios de lógica del backend, nuevos tools MCP, o ajustes al pipeline RAG. El código vive en un repo hermano, no en el directorio del frontend.
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

Trabajas en el backend del chatbot RAG, en `/home/valakyr/ClaudeCode/PersonalWebsite-backend` — un repo
**separado** del frontend (`/home/valakyr/ClaudeCode/PersonalWebsite`). Empieza siempre con
`cd /home/valakyr/ClaudeCode/PersonalWebsite-backend` y lee su `CLAUDE.md`.

Reglas de este proyecto:
- Es un servidor **MCP sobre SSE** (`src/mcp_server/server.py`), no REST. Los "endpoints" son tools
  (`upload_pdf`, `query_rag`, `clear_session`) definidos con `@app.list_tools()` / `@app.call_tool()`.
  No introduzcas rutas REST nuevas salvo utilitarias como `/health`.
- No hay base de datos — todo vive en memoria en el singleton `session_manager` (TTL, limpieza perezosa).
  Si necesitas persistencia real, eso es un cambio de arquitectura que debe discutirse primero, no
  asumirse.
- El PDF se recibe en base64 dentro del payload del tool `upload_pdf` — respeta `MAX_PDF_SIZE_MB`
  (`pdf_tools.py`) al tocar ese flujo.
- CORS se configura leyendo `ALLOWED_ORIGINS` del entorno (`server.py`) — nunca vuelvas a poner
  `allow_origins=["*"]`, eso ya fue un bug corregido.
- El cliente de Groq (`rag_tools.py`) se inicializa a nivel de módulo con `os.getenv("GROQ_API_KEY", "")`
  — en tests, siempre mockea `rag_tools.client.chat.completions.create`, nunca pegues a la API real.
- `tests/conftest.py` reemplaza `fastembed` por un embedder falso antes de cualquier import de
  `session_manager.py` — no elimines eso ni lo evadas importando directamente el paquete real en un test,
  o los tests empezarán a descargar un modelo real y a depender de red.
- **No sueltes el pin `mcp[cli]>=1.29.0,<2.0.0`** sin antes verificar que `server.py` sigue funcionando:
  `mcp` 2.0.0 eliminó los decoradores `@app.list_tools()`/`@app.call_tool()` que usa este código (rompió
  el primer deploy a producción). `tests/test_server.py` importa `server.py` de verdad — corre esa suite
  después de tocar la versión de `mcp`, no solo los tests de `session_manager`/`rag_tools`/`pdf_tools`.
- **No reintroduzcas `sentence-transformers`/PyTorch.** Se cambió a `fastembed` (ONNX Runtime) porque
  PyTorch por sí solo ya excede los 512MB del free tier de Render — cualquier dependencia nueva que
  pese mucho debe medirse primero (`resource.getrusage(...).ru_maxrss` tras importarla) antes de asumir
  que cabe.
- Después de cualquier cambio: `source .venv/bin/activate && pytest -v` (crea el venv con
  `python3 -m venv .venv && pip install -r requirements-dev.txt` si no existe).
- El deploy a Render se conecta una sola vez desde el dashboard de Render (Blueprint sobre
  `render.yaml`); después de eso, cada push a `main` redespliega solo. No está en el alcance de este
  agente conectar esa cuenta ni inventar credenciales; si el usuario lo pide, señala los pasos
  documentados en `CLAUDE.md` y en el `Plan.md` del frontend (Fase 2).
