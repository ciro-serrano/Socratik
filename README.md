# SocratiK

Plataforma de diagnóstico cognitivo y aprendizaje basado en el error — Proyecto final CoderCup IA.

## Etapa 1: correrlo en tu compu (antes de tocar Render)

1. Instalá las dependencias:
   ```
   npm install
   ```

2. Copiá el archivo de variables de entorno:
   ```
   cp .env.example .env
   ```

3. Por ahora, para probar el servidor SIN base de datos todavía, podés dejar
   `DATABASE_URL` vacío — el endpoint `/api/health` va a marcar error de DB,
   pero el servidor va a levantar igual. Eso es esperado en este punto.

4. Arrancá el servidor:
   ```
   npm run dev
   ```

5. Abrí `http://localhost:3000` en el navegador. Deberías ver la página de
   SocratiK con el mensaje de estado (probablemente diciendo que no hay DB
   conectada todavía — normal, lo resolvemos en el próximo paso).

## Próximos pasos (los vamos armando juntos)

- [ ] Crear la base de datos Postgres en Render y correr `server/db/schema.sql`
- [ ] Conseguir la API key de Gemini
- [ ] Armar el endpoint de diagnóstico (recibe código → Piston → Gemini → respuesta)
- [ ] Armar el endpoint del desafío gemelo
- [ ] Completar las pantallas del frontend
- [ ] Deploy en Render
- [ ] AGENTS.md
