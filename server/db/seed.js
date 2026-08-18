require("dotenv").config();
const pool = require("../db");

async function seed() {
  console.log("Insertando ejercicio de prueba...");

  try {
    const { rows } = await pool.query(
      `INSERT INTO ejercicios (titulo, enunciado, concepto, nivel, lenguaje, solucion_referencia)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        "Suma de pares",
        "Escribí una función que reciba un array de números y devuelva la suma de solo los números pares.",
        "loops",
        "basico",
        "javascript",
        "function sumaPares(arr) { return arr.filter(n => n % 2 === 0).reduce((a,b) => a+b, 0); }",
      ],
    );
    console.log(`✅ Ejercicio insertado con id: ${rows[0].id}`);
  } catch (err) {
    console.error("❌ Error insertando el ejercicio:");
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

seed();
