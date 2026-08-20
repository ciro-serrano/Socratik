const selectEjercicio = document.getElementById("selectEjercicio");
const enunciadoBox = document.getElementById("enunciadoBox");
const enunciadoTexto = document.getElementById("enunciadoTexto");
const formPersonalizado = document.getElementById("formPersonalizado");
const conceptoPersonalizado = document.getElementById("conceptoPersonalizado");
const nivelPersonalizado = document.getElementById("nivelPersonalizado");
const btnGenerarEjercicio = document.getElementById("btnGenerarEjercicio");
const mensajeGenerando = document.getElementById("mensajeGenerando");
const codigoInput = document.getElementById("codigo");
const btnEnviar = document.getElementById("btnEnviar");
const mensajeEstado = document.getElementById("mensajeEstado");

let ejercicios = [];

// Cargar la lista de ejercicios al abrir la pantalla
async function cargarEjercicios() {
  try {
    const res = await fetch("/api/ejercicios");
    ejercicios = await res.json();
    reconstruirSelect();
    actualizarVistaSegunSeleccion();
  } catch (err) {
    mensajeEstado.textContent = "No se pudo conectar con el servidor.";
  }
}

function reconstruirSelect(idSeleccionar) {
  const opciones = ejercicios.map(
    (ej) => `<option value="${ej.id}">${ej.titulo}</option>`,
  );
  opciones.push(
    '<option value="custom">Otro (generar uno nuevo con IA)</option>',
  );
  selectEjercicio.innerHTML = opciones.join("");
  if (idSeleccionar) {
    selectEjercicio.value = idSeleccionar;
  }
}

function actualizarVistaSegunSeleccion() {
  if (selectEjercicio.value === "custom") {
    enunciadoBox.hidden = true;
    formPersonalizado.hidden = false;
    formPersonalizado.classList.add("fade-in");
    return;
  }

  formPersonalizado.hidden = true;
  mostrarEnunciado();
}

function mostrarEnunciado() {
  const ejercicio = ejercicios.find(
    (ej) => ej.id === Number(selectEjercicio.value),
  );
  if (!ejercicio) return;
  enunciadoTexto.textContent = ejercicio.enunciado;
  enunciadoBox.hidden = false;
  enunciadoBox.classList.remove("fade-in");
  void enunciadoBox.offsetWidth; // fuerza el reinicio de la animación
  enunciadoBox.classList.add("fade-in");
}

selectEjercicio.addEventListener("change", actualizarVistaSegunSeleccion);

// Generar un ejercicio nuevo con IA a partir del concepto/nivel elegidos
btnGenerarEjercicio.addEventListener("click", async () => {
  btnGenerarEjercicio.disabled = true;
  mensajeGenerando.textContent = "Generando ejercicio...";
  mensajeGenerando.classList.add("cargando-pulso");

  try {
    const res = await fetch("/api/ejercicios/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concepto: conceptoPersonalizado.value,
        nivel: nivelPersonalizado.value,
      }),
    });

    const nuevoEjercicio = await res.json();

    if (!res.ok) {
      mensajeGenerando.textContent =
        nuevoEjercicio.error || "No se pudo generar el ejercicio.";
      mensajeGenerando.classList.remove("cargando-pulso");
      btnGenerarEjercicio.disabled = false;
      return;
    }

    ejercicios.push(nuevoEjercicio);
    reconstruirSelect(nuevoEjercicio.id);
    actualizarVistaSegunSeleccion();

    mensajeGenerando.textContent = "";
    mensajeGenerando.classList.remove("cargando-pulso");
  } catch (err) {
    mensajeGenerando.textContent = "No se pudo conectar con el servidor.";
    mensajeGenerando.classList.remove("cargando-pulso");
  } finally {
    btnGenerarEjercicio.disabled = false;
  }
});

// Enviar el intento y pasar a la Pantalla 2 (diagnóstico)
btnEnviar.addEventListener("click", async () => {
  if (selectEjercicio.value === "custom") {
    mensajeEstado.textContent =
      "Primero generá un ejercicio con el botón de arriba.";
    return;
  }

  const codigo = codigoInput.value.trim();

  if (!codigo) {
    mensajeEstado.textContent =
      "Escribí tu intento de solución antes de continuar.";
    return;
  }

  btnEnviar.disabled = true;
  mensajeEstado.textContent =
    "Analizando tu razonamiento... (puede tardar unos segundos)";
  mensajeEstado.classList.add("cargando-pulso");

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
      mensajeEstado.classList.remove("cargando-pulso");
      btnEnviar.disabled = false;
      return;
    }

    sessionStorage.setItem("ultimoDiagnostico", JSON.stringify(data));
    window.location.href = "diagnostico.html";
  } catch (err) {
    mensajeEstado.textContent = "No se pudo conectar con el servidor.";
    mensajeEstado.classList.remove("cargando-pulso");
    btnEnviar.disabled = false;
  }
});

cargarEjercicios();
