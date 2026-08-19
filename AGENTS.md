# AGENTS.md — SocratiK

Plataforma de diagnóstico cognitivo y aprendizaje basado en el error.
Proyecto final — CoderCup IA (Coderhouse).

## Qué hace el proyecto

El alumno sube un ejercicio de programación + su intento de solución. SocratiK:

1. Ejecuta el código en un sandbox
2. Le pide a Gemini que identifique dónde se rompió el razonamiento (sin dar la respuesta)
3. Genera un ejercicio "gemelo" (mismo concepto, distinto contexto) para confirmar que el
   alumno aprendió de verdad, no que copió una corrección

## Regla de oro (no negociable)

**Ningún prompt de este proyecto debe pedirle a la IA que dé la solución correcta o el
código corregido.** Toda la propuesta de valor de SocratiK depende de esto. Si se modifica
algún prompt en `server/services/gemini.js`, esta regla se mantiene siempre.

## Stack

- Backend: Node.js + Express
- Base de datos: PostgreSQL (en Render)
- IA: Gemini API (`gemini-3.6-flash`)
- Sandbox de ejecución: módulo `vm` nativo de Node (no Docker/Piston — decisión tomada
  porque Piston dejó de ser gratuita/abierta; el sandbox actual solo soporta JavaScript)
- Frontend: HTML/CSS/JS vanilla, multi-página (no SPA, no framework)
- Hosting: Render (free tier)

## Estructura

```
server/
  index.js              → arranca Express, registra rutas
  db.js                 → conexión a Postgres (SSL siempre requerido, también en local)
  routes/
    ejercicios.js        → GET listado y detalle de ejercicios
    diagnostico.js        → POST: código → sandbox → Gemini → guarda en DB
    desafioGemelo.js      → POST: genera y valida el ejercicio gemelo
  services/
    sandbox.js            → ejecuta JS en un contexto vm aislado, con timeout
    gemini.js              → prompts de sistema + llamadas a la API de Gemini
  db/
    schema.sql             → estructura de tablas (ejercicios, intentos, desafios_gemelos)
    migrate.js / seed.js   → scripts para correr el schema y cargar datos sin psql
public/
  index.html / diagnostico.html / desafio.html / resultado.html → las 4 pantallas del flujo
```

## Convenciones

- Todo el código y los comentarios en español (así lo pidió el autor del proyecto).
- Nombres de variables y funciones en español donde sea natural (`ejercicios`, `intentos`,
  `generarDiagnostico`), en inglés solo si es un término técnico estándar.
- Nunca exponer `GEMINI_API_KEY` ni `DATABASE_URL` del lado del cliente — todas las
  llamadas a servicios externos pasan por rutas del servidor (`server/routes/`).
- No agregar frameworks de frontend (React, Vue, etc.) — decisión consciente por alcance
  y tiempo del proyecto.

## Roadmap futuro (no implementado en esta entrega)

- Rol docente con dashboard de "puntos ciegos" de la clase (analytics agregados de errores
  comunes)
- Soporte de otros lenguajes/materias además de JavaScript/programación
