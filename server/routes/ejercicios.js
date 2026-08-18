const express = require("express");
const router = express.Router();
const pool = require("../db");

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

module.exports = router;
