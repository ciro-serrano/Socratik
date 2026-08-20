const express = require("express");
const router = express.Router();
const pool = require("../db");
const { generarEjercicioNuevo } = require("../services/gemini");

// GET /api/ejercicios -> lista todos (sin la solución de referencia, esa es interna)
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, titulo, enunciado, concepto, nivel, lenguaje FROM ejercicios ORDER BY id",
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /api/ejercicios:", err);
    res.status(500).json({ error: "No se pudieron obtener los ejercicios." });
  }
});

// GET /api/ejercicios/:id -> uno solo (tampoco expone la solución de referencia)
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, titulo, enunciado, concepto, nivel, lenguaje FROM ejercicios WHERE id = $1",
      [req.params.id],
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "Ejercicio no encontrado." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error en GET /api/ejercicios/:id:", err);
    res.status(500).json({ error: "No se pudo obtener el ejercicio." });
  }
});

// POST /api/ejercicios/generar -> la IA genera un ejercicio nuevo y se guarda en la DB
// Body: { concepto, nivel }
router.post("/generar", async (req, res) => {
  const { concepto, nivel } = req.body;

  if (!concepto || !nivel) {
    return res.status(400).json({ error: "Faltan concepto o nivel." });
  }

  try {
    const { titulo, enunciado, solucionReferencia } =
      await generarEjercicioNuevo({ concepto, nivel });

    const { rows } = await pool.query(
      `INSERT INTO ejercicios (titulo, enunciado, concepto, nivel, lenguaje, solucion_referencia)
       VALUES ($1, $2, $3, $4, 'javascript', $5)
       RETURNING id, titulo, enunciado, concepto, nivel, lenguaje`,
      [titulo, enunciado, concepto, nivel, solucionReferencia],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error en POST /api/ejercicios/generar:", err);
    res.status(500).json({ error: "No se pudo generar el ejercicio." });
  }
});

module.exports = router;
