// Sandbox de ejecución usando el módulo 'vm' nativo de Node.js.
// No es aislamiento a nivel de sistema operativo (como Docker/Piston),
// pero corre el código en un contexto separado, sin acceso a
// require, process, fs, ni al resto del servidor, y con límite de tiempo.
// Suficiente para el alcance de este proyecto (solo JavaScript).

const vm = require("vm");

const TIMEOUT_MS = 3000;

function ejecutarCodigo(codigo, lenguaje = "javascript") {
  if (lenguaje !== "javascript") {
    return Promise.reject(
      new Error(
        `El sandbox por ahora solo soporta JavaScript (se pidió: ${lenguaje})`,
      ),
    );
  }

  const logs = [];
  const sandboxContext = {
    console: {
      log: (...args) => {
        logs.push(
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
            .join(" "),
        );
      },
    },
  };

  vm.createContext(sandboxContext);

  try {
    const script = new vm.Script(codigo);
    script.runInContext(sandboxContext, { timeout: TIMEOUT_MS });

    return Promise.resolve({
      salida: logs.join("\n"),
      error: "",
      exitoso: true,
    });
  } catch (err) {
    return Promise.resolve({
      salida: logs.join("\n"),
      error: err.message,
      exitoso: false,
    });
  }
}

module.exports = { ejecutarCodigo };
