const cargando = document.getElementById("cargando");
const contenidoDesafio = document.getElementById("contenidoDesafio");
const enunciadoGemelo = document.getElementById("enunciadoGemelo");
const codigoGemelo = document.getElementById("codigoGemelo");
const btnValidar = document.getElementById("btnValidar");
const resultadoBox = document.getElementById("resultadoBox");
const resultadoTitulo = document.getElementById("resultadoTitulo");
const resultadoFeedback = document.getElementById("resultadoFeedback");
const btnContinuar = document.getElementById("btnContinuar");
const btnReintentar = document.getElementById("btnReintentar");

let desafioId = null;

async function generarDesafio() {
  const dataGuardada = sessionStorage.getItem("ultimoDiagnostico");
  if (!dataGuardada) {
    cargando.textContent =
      "No hay un intento previo. Volvé a la pantalla de inicio.";
    return;
  }

  const { intento_id } = JSON.parse(dataGuardada);

  try {
    const res = await fetch("/api/desafio-gemelo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intento_id }),
    });
    const data = await res.json();

    if (!res.ok) {
      cargando.textContent = data.error || "No se pudo generar el desafío.";
      return;
    }

    desafioId = data.desafio_id;
    enunciadoGemelo.textContent = data.enunciado;

    cargando.hidden = true;
    contenidoDesafio.hidden = false;
  } catch (err) {
    cargando.textContent = "No se pudo conectar con el servidor.";
  }
}

btnValidar.addEventListener("click", async () => {
  const codigo = codigoGemelo.value.trim();
  if (!codigo) return;

  btnValidar.disabled = true;
  btnValidar.textContent = "Validando...";

  try {
    const res = await fetch(`/api/desafio-gemelo/${desafioId}/validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
    });
    const data = await res.json();

    resultadoBox.hidden = false;

    if (data.correcto) {
      resultadoTitulo.textContent =
        "✅ ¡Resuelto! Confirmaste que entendiste el concepto.";
      btnContinuar.hidden = false;
    } else {
      resultadoTitulo.textContent = "⚠️ Todavía no. Revisá el feedback:";
      btnReintentar.hidden = false;
    }
    resultadoFeedback.textContent = data.feedback;
  } catch (err) {
    resultadoBox.hidden = false;
    resultadoTitulo.textContent = "Error al validar.";
  } finally {
    btnValidar.disabled = false;
    btnValidar.textContent = "Validar mi solución";
  }
});

btnContinuar.addEventListener("click", () => {
  window.location.href = "resultado.html?exito=1";
});

btnReintentar.addEventListener("click", () => {
  resultadoBox.hidden = true;
  btnReintentar.hidden = true;
  btnContinuar.hidden = true;
});

generarDesafio();
