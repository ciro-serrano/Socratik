# SocratiK

**Plataforma de diagnóstico cognitivo y aprendizaje basado en el error.**
Proyecto final — CoderCup IA (Coderhouse).

🔗 **Demo en vivo:** [https://socratik.onrender.com/]

## El problema

Los estudiantes de programación copian soluciones (de compañeros, de tutoriales, de la
propia IA) sin entender por qué su código original fallaba. Aprenden a resolver un
ejercicio puntual, pero no corrigen el error de razonamiento — así que lo repiten en el
próximo.

## La solución

SocratiK invierte la lógica habitual de "te doy la respuesta": el alumno sube su intento
de solución, y en vez de corregirlo, **le muestra dónde se rompió su razonamiento**, paso
a paso, sin nunca darle el código correcto. Después le propone un ejercicio "gemelo" —
mismo concepto, distinto contexto — para confirmar que entendió de verdad, no que memorizó
una corrección.

El nombre es un homenaje al método mayéutico de Sócrates: enseñar preguntando, no
respondiendo.

## Cómo funciona (flujo)

1. **Inicio** → el alumno elige un ejercicio y escribe su intento de solución
2. **Diagnóstico** → el código corre en un sandbox y Gemini identifica el punto exacto
   del error de razonamiento (marcado con ✅/⚠️), cerrando con una pregunta guía
3. **Desafío gemelo** → un ejercicio nuevo sobre el mismo concepto, para validar el
   aprendizaje en el momento
4. **Resultado** → cierre del ciclo, listo para practicar con otro ejercicio

## Stack

| Capa                 | Tecnología                      |
| -------------------- | ------------------------------- |
| Backend              | Node.js + Express               |
| Base de datos        | PostgreSQL (Render)             |
| IA                   | Gemini API                      |
| Sandbox de ejecución | Módulo `vm` nativo de Node.js   |
| Frontend             | HTML / CSS / JavaScript vanilla |
| Hosting              | Render                          |

## Correrlo en local

```bash
npm install
cp .env.example .env   # completar con tu DATABASE_URL y GEMINI_API_KEY
npm run migrate        # crea las tablas
npm run seed            # carga un ejercicio de prueba
npm run dev
```

Abrir `http://localhost:3000`.

## Roadmap futuro

- Rol docente con un dashboard de "puntos ciegos" de la clase (qué error de razonamiento
  se repite más entre los alumnos)
- Soporte de otras materias/lenguajes además de programación en JavaScript

## Créditos

Desarrollado por Ciro Serrano para la CoderCup IA de Coderhouse (agosto 2026).
