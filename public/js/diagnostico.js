const ejecucionTexto = document.getElementById("ejecucionTexto");
const pasosBox = document.getElementById("pasosBox");
const preguntaBox = document.getElementById("preguntaBox");
const preguntaTexto = document.getElementById("preguntaTexto");
const btnDesafio = document.getElementById("btnDesafio");
const btnVolver = document.getElementById("btnVolver");

const dataGuardada = sessionStorage.getItem("ultimoDiagnostico");

if (!dataGuardada) {
  // Si alguien entra directo a esta URL sin pasar por la Pantalla 1
  pasosBox.innerHTML =
    "<p>No hay ningún diagnóstico para mostrar. Volvé a la pantalla anterior.</p>";
  btnDesafio.hidden = true;
} else {
  const data = JSON.parse(dataGuardada);
  mostrarResultado(data);
}

function mostrarResultado(data) {
  // 1. Resultado de la ejecución
  if (data.ejecucion.exitoso) {
    ejecucionTexto.textContent = data.ejecucion.salida
      ? `Tu código corrió sin errores de sintaxis. Salida: ${data.ejecucion.salida}`
      : "Tu código corrió sin errores de sintaxis (esto no significa que el resultado sea correcto — mirá el diagnóstico de abajo).";
  } else {
    ejecucionTexto.textContent = `Tu código tuvo un error al ejecutarse: ${data.ejecucion.error}`;
  }

  // 2. Parsear el texto de diagnóstico (formato: PASOS: ... PREGUNTA_GUIA: ...)
  const texto = data.diagnostico || "";
  const [bloquePasos, bloquePregunta] = texto.split("PREGUNTA_GUIA:");

  // Cada línea de paso empieza con un número. Buscamos si tiene ⚠️ o ✅.
  const lineasPaso = bloquePasos
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d+\./.test(l));

  if (lineasPaso.length === 0) {
    // Si el modelo no respetó el formato exacto, mostramos el texto crudo igual
    pasosBox.innerHTML = `<p class="fade-in">${bloquePasos.replace("PASOS:", "").trim()}</p>`;
  } else {
    pasosBox.innerHTML = lineasPaso
      .map((linea, i) => {
        const esAlerta = linea.includes("⚠️");
        const clase = esAlerta ? "paso-alerta" : "paso-ok";
        const delay = (i * 0.25).toFixed(2);
        return `<div class="diagnostico-paso ${clase} fade-in" style="animation-delay:${delay}s">${linea}</div>`;
      })
      .join("");
  }

  // 3. Pregunta guía
  if (bloquePregunta && bloquePregunta.trim()) {
    preguntaTexto.textContent = bloquePregunta.trim();
    preguntaBox.hidden = false;
    preguntaBox.classList.add("fade-in");
    preguntaBox.style.animationDelay = `${(lineasPaso.length * 0.25 + 0.2).toFixed(2)}s`;
  }
}

btnDesafio.addEventListener("click", () => {
  window.location.href = "desafio.html";
});

btnVolver.addEventListener("click", () => {
  window.location.href = "index.html";
});
