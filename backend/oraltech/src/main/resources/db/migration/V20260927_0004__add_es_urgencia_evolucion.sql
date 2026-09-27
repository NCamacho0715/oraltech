-- HU-3 Cita obligatoria / urgencia: marca de atención por urgencia en evoluciones.
-- Aditiva y sin pérdida de datos: las evoluciones históricas quedan en FALSE
-- (atención con cita, comportamiento anterior).
ALTER TABLE public.evolucion_clinica
    ADD COLUMN IF NOT EXISTS es_urgencia BOOLEAN NOT NULL DEFAULT FALSE;
