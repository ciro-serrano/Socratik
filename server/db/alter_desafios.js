require("dotenv").config();
const pool = require("../db");

async function alterar() {
  console.log("Agregando columna solucion_referencia a desafios_gemelos...");
  try {
    await pool.query(
      "ALTER TABLE desafios_gemelos ADD COLUMN IF NOT EXISTS solucion_referencia TEXT",
    );
    console.log("✅ Listo.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

alterar();
