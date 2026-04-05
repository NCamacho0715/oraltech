-- V1__Fix_Odontograma_Constraint.sql
-- This migration ensures the odontograma_registro table allows all modern clinical conventions
-- by dropping the restrictive check constraint.

ALTER TABLE odontograma_registro DROP CONSTRAINT IF EXISTS odontograma_registro_tipo_evento_check;
