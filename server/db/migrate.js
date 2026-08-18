require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function migrar() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Ejecutando schema.sql contra la base de datos...');

  try {
    await pool.query(sql);
    console.log('✅ Listo. Las tablas ejercicios, intentos y desafios_gemelos ya existen.');
  } catch (err) {
    console.error('❌ Hubo un error al ejecutar el schema:');
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

migrar();
