-- ============================================
-- SocratiK · Modelo de datos
-- Ejecutar esto una vez contra la base de Postgres en Render
-- ============================================

-- Catálogo de ejercicios disponibles (los cargás vos como "seed" inicial)
CREATE TABLE ejercicios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    enunciado TEXT NOT NULL,
    concepto VARCHAR(50) NOT NULL,        -- ej: 'loops', 'condicionales', 'recursividad'
    nivel VARCHAR(20) NOT NULL DEFAULT 'basico', -- 'basico' | 'intermedio' | 'avanzado'
    lenguaje VARCHAR(20) NOT NULL DEFAULT 'javascript', -- el que soporte Piston
    solucion_referencia TEXT,             -- NO se muestra al alumno; la usa la IA como referencia interna
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Cada intento que un alumno sube para un ejercicio
CREATE TABLE intentos (
    id SERIAL PRIMARY KEY,
    ejercicio_id INTEGER NOT NULL REFERENCES ejercicios(id),
    codigo_alumno TEXT NOT NULL,
    resultado_ejecucion TEXT,             -- output/stderr que devuelve Piston
    ejecucion_exitosa BOOLEAN,            -- corrió sin errores de sintaxis/runtime
    diagnostico_ia TEXT,                  -- explicación del razonamiento erróneo (sin dar la respuesta)
    intento_numero INTEGER DEFAULT 1,     -- por si vuelve del desafío gemelo a reintentar
    creado_en TIMESTAMP DEFAULT NOW()
);

-- El micro-desafío gemelo generado a partir de un intento
CREATE TABLE desafios_gemelos (
    id SERIAL PRIMARY KEY,
    intento_id INTEGER NOT NULL REFERENCES intentos(id),
    enunciado_generado TEXT NOT NULL,     -- ejercicio nuevo, mismo concepto, distinto contexto
    codigo_alumno TEXT,                   -- lo que el alumno respondió al desafío
    resuelto_correctamente BOOLEAN,       -- valida si de verdad aprendió
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Índices para las consultas más comunes (historial por ejercicio)
CREATE INDEX idx_intentos_ejercicio ON intentos(ejercicio_id);
CREATE INDEX idx_desafios_intento ON desafios_gemelos(intento_id);
