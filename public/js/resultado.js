document.getElementById("btnNuevoEjercicio").addEventListener("click", () => {
  // Limpiamos el diagnóstico anterior para que el próximo ciclo arranque de cero
  sessionStorage.removeItem("ultimoDiagnostico");
  window.location.href = "index.html";
});
