-- HU Plan de tratamiento: modelo completo (descripcion del plan + auditoría de ítems).
-- Aditiva y sin pérdida de datos: todas las columnas nuevas aceptan NULL para
-- conservar las filas existentes de plan_tratamiento/plan_item.

-- Descripción general del plan (la UI la captura como obligatoria desde este cambio).
ALTER TABLE public.plan_tratamiento
    ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- PlanItem deja de ser huérfano de auditoría: mismas columnas que AuditFields.
ALTER TABLE public.plan_item
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS created_by CHARACTER VARYING(255),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS updated_by CHARACTER VARYING(255);
