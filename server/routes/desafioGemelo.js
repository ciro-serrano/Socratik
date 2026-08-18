const express = require("express");
const router = express.Router();
const pool = require("../db");
const { ejecutarCodigo } = require("../services/sandbox");
const {
  generarDesafioGemelo,
  validarDesafioGemelo,
} = require("../services/gemini");

// POST /api/desafio-gemelo -> genera un ejercicio "hermano" a partir de un intento previo
// Body: { intento_id }
router.post("/", async (req, res) => {
  const { intento_id } = req.body;

  if (!intento_id) {
    return res.status(400).json({ error: "Falta intento_id." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT i.id AS intento_id, e.enunciado, e.concepto, e.solucion_referencia
       FROM intentos i
       JOIN ejercicios e ON e.id = i.ejercicio_id
       WHERE i.id = $1`,
      [intento_id],
    );
    const contexto = rows[0];

    if (!contexto) {
      return res.status(404).json({ error: "Intento no encontrado." });
    }

    const { enunciado, solucionReferencia } = await generarDesafioGemelo({
      enunciadoOriginal: contexto.enunciado,
      concepto: contexto.concepto,
      solucionReferenciaOriginal: contexto.solucion_referencia,
    });

    const insert = await pool.query(
      `INSERT INTO desafios_gemelos (intento_id, enunciado_generado, solucion_referencia)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [intento_id, enunciado, solucionReferencia],
    );

    res.json({ desafio_id: insert.rows[0].id, enunciado });
  } catch (err) {
    console.error("Error en POST /api/desafio-gemelo:", err);
    res.status(500).json({ error: "No se pudo generar el desafío gemelo." });
  }
});

// POST /api/desafio-gemelo/:id/validar -> valida la respuesta del alumno al desafío
// Body: { codigo }
router.post("/:id/validar", async (req, res) => {
  const { codigo } = req.body;
  const desafioId = req.params.id;

  if (!codigo) {
    return res.status(400).json({ error: "Falta el código." });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM desafios_gemelos WHERE id = $1",
      [desafioId],
    );
    const desafio = rows[0];

    if (!desafio) {
      return res.status(404).json({ error: "Desafío no encontrado." });
    }

    const resultadoEjecucion = await ejecutarCodigo(codigo, "javascript");

    const { correcto, feedback } = await validarDesafioGemelo({
      enunciado: desafio.enunciado_generado,
      solucionReferencia: desafio.solucion_referencia,
      codigoAlumno: codigo,
      resultadoEjecucion,
    });

    await pool.query(
      `UPDATE desafios_gemelos
       SET codigo_alumno = $1, resuelto_correctamente = $2
       WHERE id = $3`,
      [codigo, correcto, desafioId],
    );

    res.json({ correcto, feedback, ejecucion: resultadoEjecucion });
  } catch (err) {
    console.error("Error en POST /api/desafio-gemelo/:id/validar:", err);
    res.status(500).json({ error: "No se pudo validar el desafío." });
  }
});

module.exports = router;
