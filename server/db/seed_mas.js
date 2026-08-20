require("dotenv").config();
const pool = require("../db");

const nuevosEjercicios = [
  {
    titulo: "Número máximo",
    enunciado:
      "Escribí una función que reciba un array de números y devuelva el número más grande.",
    concepto: "loops",
    nivel: "basico",
    lenguaje: "javascript",
    solucion_referencia: "function maximo(arr) { return Math.max(...arr); }",
  },
  {
    titulo: "Par o impar",
    enunciado:
      'Escribí una función que reciba un número y devuelva el string "par" si es par, o "impar" si es impar.',
    concepto: "condicionales",
    nivel: "basico",
    lenguaje: "javascript",
    solucion_referencia:
      'function parOImpar(n) { return n % 2 === 0 ? "par" : "impar"; }',
  },
];

async function seedMas() {
  console.log("Insertando ejercicios adicionales...");
  try {
    for (const ej of nuevosEjercicios) {
      const { rows } = await pool.query(
        `INSERT INTO ejercicios (titulo, enunciado, concepto, nivel, lenguaje, solucion_referencia)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          ej.titulo,
          ej.enunciado,
          ej.concepto,
          ej.nivel,
          ej.lenguaje,
          ej.solucion_referencia,
        ],
      );
      console.log(`✅ "${ej.titulo}" insertado con id: ${rows[0].id}`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

seedMas();
