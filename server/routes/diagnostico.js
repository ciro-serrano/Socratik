const express = require("express");
const router = express.Router();
const pool = require("../db");
const { ejecutarCodigo } = require("../services/sandbox");
const { generarDiagnostico } = require("../services/gemini");

// POST /api/diagnostico
// Body esperado: { ejercicio_id: number, codigo: string }
router.post("/", async (req, res) => {
  const { ejercicio_id, codigo } = req.body;

  if (!ejercicio_id || !codigo) {
    return res
      .status(400)
      .json({ error: "Faltan ejercicio_id o codigo en la petición." });
  }

  try {
    // 1. Buscar el ejercicio en la DB
    const { rows } = await pool.query(
      "SELECT * FROM ejercicios WHERE id = $1",
      [ejercicio_id],
    );
    const ejercicio = rows[0];

    if (!ejercicio) {
      return res.status(404).json({ error: "Ejercicio no encontrado." });
    }

    // 2. Ejecutar el código del alumno en el sandbox
    const resultadoEjecucion = await ejecutarCodigo(codigo, ejercicio.lenguaje);

    // 3. Pedirle el diagnóstico a Gemini
    const diagnostico = await generarDiagnostico({
      enunciado: ejercicio.enunciado,
      solucionReferencia:
        ejercicio.solucion_referencia ||
        "No se proporcionó una solución de referencia; inferí vos el comportamiento esperado a partir del enunciado.",
      codigoAlumno: codigo,
      resultadoEjecucion,
    });

    // 4. Guardar el intento completo en la DB
    const insert = await pool.query(
      `INSERT INTO intentos
        (ejercicio_id, codigo_alumno, resultado_ejecucion, ejecucion_exitosa, diagnostico_ia)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        ejercicio_id,
        codigo,
        resultadoEjecucion.error || resultadoEjecucion.salida,
        resultadoEjecucion.exitoso,
        diagnostico,
      ],
    );

    // 5. Devolver todo al frontend
    res.json({
      intento_id: insert.rows[0].id,
      ejecucion: resultadoEjecucion,
      diagnostico,
    });
  } catch (err) {
    console.error("Error en /api/diagnostico:", err);
    res
      .status(500)
      .json({ error: "Ocurrió un error generando el diagnóstico." });
  }
});

module.exports = router;
