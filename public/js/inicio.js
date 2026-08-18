const selectEjercicio = document.getElementById("selectEjercicio");
const enunciadoBox = document.getElementById("enunciadoBox");
const enunciadoTexto = document.getElementById("enunciadoTexto");
const codigoInput = document.getElementById("codigo");
const btnEnviar = document.getElementById("btnEnviar");
const mensajeEstado = document.getElementById("mensajeEstado");

let ejercicios = [];

// Cargar la lista de ejercicios al abrir la pantalla
async function cargarEjercicios() {
  try {
    const res = await fetch("/api/ejercicios");
    ejercicios = await res.json();

    if (ejercicios.length === 0) {
      mensajeEstado.textContent = "Todavía no hay ejercicios cargados.";
      return;
    }

    selectEjercicio.innerHTML = ejercicios
      .map((ej) => `<option value="${ej.id}">${ej.titulo}</option>`)
      .join("");

    mostrarEnunciado();
  } catch (err) {
    mensajeEstado.textContent = "No se pudo conectar con el servidor.";
  }
}

function mostrarEnunciado() {
  const ejercicio = ejercicios.find(
    (ej) => ej.id === Number(selectEjercicio.value),
  );
  if (!ejercicio) return;
  enunciadoTexto.textContent = ejercicio.enunciado;
  enunciadoBox.hidden = false;
}

selectEjercicio.addEventListener("change", mostrarEnunciado);

// Enviar el intento y pasar a la Pantalla 2 (diagnóstico)
btnEnviar.addEventListener("click", async () => {
  const codigo = codigoInput.value.trim();

  if (!codigo) {
    mensajeEstado.textContent =
      "Escribí tu intento de solución antes de continuar.";
    return;
  }

  btnEnviar.disabled = true;
  mensajeEstado.textContent =
    "Analizando tu razonamiento... (puede tardar unos segundos)";

  try {
    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ejercicio_id: Number(selectEjercicio.value),
        codigo,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mensajeEstado.textContent = data.error || "Ocurrió un error.";
      btnEnviar.disabled = false;
      return;
    }

    // Guardamos el resultado para que la Pantalla 2 lo lea, y navegamos
    sessionStorage.setItem("ultimoDiagnostico", JSON.stringify(data));
    window.location.href = "diagnostico.html";
  } catch (err) {
    mensajeEstado.textContent = "No se pudo conectar con el servidor.";
    btnEnviar.disabled = false;
  }
});

cargarEjercicios();
