require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servimos el frontend estático (public/)
app.use(express.static(path.join(__dirname, "..", "public")));

// Rutas de la API
app.use("/api/diagnostico", require("./routes/diagnostico"));
app.use("/api/ejercicios", require("./routes/ejercicios"));
app.use("/api/desafio-gemelo", require("./routes/desafioGemelo"));
// Endpoint de salud: confirma que el server y la DB están vivos
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "conectada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", db: "sin conexión" });
  }
});

app.listen(PORT, () => {
  console.log(`SocratiK corriendo en http://localhost:${PORT}`);
});
