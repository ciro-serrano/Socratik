const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

// Prompt de sistema: acá vive la regla más importante de todo el proyecto.
// Nunca dar la respuesta correcta. Solo señalar el punto de quiebre del razonamiento.
const PROMPT_SISTEMA = `Sos un tutor socrático de programación. Tu único trabajo es ayudar a un
estudiante a encontrar POR SÍ MISMO dónde se rompió su razonamiento lógico.

Reglas estrictas:
1. NUNCA escribas ni sugieras el código correcto o la solución.
2. NUNCA reescribas el código del alumno corregido.
3. Identificá el punto EXACTO (línea o fragmento) donde el razonamiento se desvía del objetivo.
4. Explicá el error de razonamiento en pasos numerados (Chain-of-Thought), marcando con
   ⚠️ el paso donde ocurre el desvío. Los pasos anteriores al desvío se marcan con ✅.
5. Terminá con una pregunta guía (al estilo socrático) que empuje al alumno a pensar la
   corrección por su cuenta, sin dársela.
6. Tono: cercano, paciente, nunca condescendiente.

Formato de respuesta esperado (texto plano, sin markdown):
PASOS:
1. [✅/⚠️] descripción del paso
2. [✅/⚠️] descripción del paso
...
PREGUNTA_GUIA: [tu pregunta socrática acá]`;

async function generarDiagnostico({
  enunciado,
  solucionReferencia,
  codigoAlumno,
  resultadoEjecucion,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en el .env");
  }

  // Prompt de usuario armado con O.C.F.E.: Objetivo, Contexto, Formato, Ejemplos (implícito en el sistema)
  const promptUsuario = `
OBJETIVO: Diagnosticar dónde falló el razonamiento del alumno en este ejercicio.

CONTEXTO:
- Enunciado del ejercicio: ${enunciado}
- Solución de referencia (SOLO para tu análisis interno, jamás la reveles): ${solucionReferencia}
- Código que escribió el alumno:
\`\`\`
${codigoAlumno}
\`\`\`
- Resultado de ejecutar ese código: ${resultadoEjecucion.exitoso ? "Corrió sin errores" : "Falló"}
  ${resultadoEjecucion.error ? `Error: ${resultadoEjecucion.error}` : ""}
  ${resultadoEjecucion.salida ? `Salida: ${resultadoEjecucion.salida}` : ""}

FORMATO: Seguí exactamente el formato de PASOS + PREGUNTA_GUIA indicado en tus instrucciones.
`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: PROMPT_SISTEMA }] },
      contents: [{ role: "user", parts: [{ text: promptUsuario }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini respondió con error ${response.status}: ${errorBody}`,
    );
  }

  const data = await response.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!texto) {
    throw new Error("Gemini no devolvió contenido utilizable");
  }

  return texto;
}

async function generarDesafioGemelo({
  enunciadoOriginal,
  concepto,
  solucionReferenciaOriginal,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en el .env");
  }

  const promptSistema = `Sos un diseñador de ejercicios de programación. Tu trabajo es crear un
ejercicio "gemelo" de otro: mismo concepto y mismo nivel de dificultad, pero con un
enunciado y contexto distintos (otra historia, otros nombres de variables sugeridos).

Formato de respuesta esperado (texto plano, sin markdown):
ENUNCIADO: [el nuevo enunciado, autocontenido y claro]
SOLUCION_REFERENCIA: [código de referencia correcto en JavaScript, para uso interno, nunca se lo mostrás al alumno]`;

  const promptUsuario = `
Concepto a reforzar: ${concepto}
Ejercicio original (para que generes uno "hermano", NO lo repitas): ${enunciadoOriginal}
Solución del ejercicio original (referencia de nivel/alcance): ${solucionReferenciaOriginal}
`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: promptSistema }] },
      contents: [{ role: "user", parts: [{ text: promptUsuario }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini respondió con error ${response.status}: ${errorBody}`,
    );
  }

  const data = await response.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const enunciadoMatch = texto.match(
    /ENUNCIADO:\s*([\s\S]*?)SOLUCION_REFERENCIA:/,
  );
  const solucionMatch = texto.match(/SOLUCION_REFERENCIA:\s*([\s\S]*)/);

  return {
    enunciado: enunciadoMatch ? enunciadoMatch[1].trim() : texto.trim(),
    solucionReferencia: solucionMatch ? solucionMatch[1].trim() : "",
  };
}

async function validarDesafioGemelo({
  enunciado,
  solucionReferencia,
  codigoAlumno,
  resultadoEjecucion,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en el .env");
  }

  const promptSistema = `Sos un evaluador socrático de ejercicios de programación. Determiná si el
código del alumno resuelve correctamente el ejercicio planteado, comparándolo contra la
lógica esperada. Sé estricto pero justo: pequeñas diferencias de estilo no importan, lo
que importa es que el comportamiento sea correcto.

Regla clave: si está INCORRECTO, NUNCA reveles la solución ni el cambio exacto a hacer
(por ejemplo, nunca digas "cambiá tal condición por tal otra"). En cambio, señalá en qué
parte del código está el desvío de razonamiento y cerrá con una pregunta que lo guíe a
encontrarlo por su cuenta — mismo criterio que el diagnóstico principal. Si está CORRECTO,
sí podés confirmarlo con un comentario breve y alentador.

Formato de respuesta esperado (texto plano, sin markdown):
VEREDICTO: CORRECTO o INCORRECTO
FEEDBACK: [si es CORRECTO: un párrafo breve confirmando y felicitando.
           si es INCORRECTO: señalá dónde está el desvío de razonamiento (sin dar la
           solución) y cerrá con una pregunta guía socrática]`;

  const promptUsuario = `
Enunciado: ${enunciado}
Solución de referencia (uso interno): ${solucionReferencia}
Código del alumno:
\`\`\`
${codigoAlumno}
\`\`\`
Resultado de ejecutarlo: ${resultadoEjecucion.exitoso ? "Corrió sin errores" : `Falló: ${resultadoEjecucion.error}`}
`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: promptSistema }] },
      contents: [{ role: "user", parts: [{ text: promptUsuario }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini respondió con error ${response.status}: ${errorBody}`,
    );
  }

  const data = await response.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const correcto = /VEREDICTO:\s*CORRECTO/i.test(texto);
  const feedbackMatch = texto.match(/FEEDBACK:\s*([\s\S]*)/);

  return {
    correcto,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : texto.trim(),
  };
}

async function generarEjercicioNuevo({ concepto, nivel }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en el .env");
  }

  const promptSistema = `Sos un diseñador de ejercicios de programación en JavaScript para
estudiantes. Creá un ejercicio original, claro y autocontenido.

Formato de respuesta esperado (texto plano, sin markdown):
TITULO: [título corto, 3-6 palabras]
ENUNCIADO: [el enunciado completo, autocontenido y claro]
SOLUCION_REFERENCIA: [código de referencia correcto en JavaScript, para uso interno, nunca se lo mostrás al alumno]`;

  const promptUsuario = `
Concepto a practicar: ${concepto}
Nivel: ${nivel}
`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: promptSistema }] },
      contents: [{ role: "user", parts: [{ text: promptUsuario }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini respondió con error ${response.status}: ${errorBody}`,
    );
  }

  const data = await response.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const tituloMatch = texto.match(/TITULO:\s*(.*)/);
  const enunciadoMatch = texto.match(
    /ENUNCIADO:\s*([\s\S]*?)SOLUCION_REFERENCIA:/,
  );
  const solucionMatch = texto.match(/SOLUCION_REFERENCIA:\s*([\s\S]*)/);

  return {
    titulo: tituloMatch ? tituloMatch[1].trim() : `Ejercicio de ${concepto}`,
    enunciado: enunciadoMatch ? enunciadoMatch[1].trim() : texto.trim(),
    solucionReferencia: solucionMatch ? solucionMatch[1].trim() : "",
  };
}

module.exports = {
  generarDiagnostico,
  generarDesafioGemelo,
  validarDesafioGemelo,
  generarEjercicioNuevo,
};
