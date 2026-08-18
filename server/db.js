const { Pool } = require("pg");

// Render nos da un DATABASE_URL completo. Usamos SSL en producción (Render lo requiere).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Render exige SSL en todas las conexiones, también en local
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de Postgres:", err);
});

module.exports = pool;
