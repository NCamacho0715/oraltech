import React, { useState, useEffect } from "react";
import { Plus, ListChecks, Calendar, User } from "lucide-react";
import clinicaService from "../../services/clinicaService";
import { formatCOP, formatCOPInput, parseCOP } from "../../utils/copMoney";
import { parseFechaLocal } from "../../utils/fechas";

// Decisión de modelo (documentada en docs/plan-tratamiento-modelo.md):
// El plan tiene descripción general + ítems {descripcion, tarifa, total}.
// El odontólogo prescriptor se resuelve del usuario autenticado (no viaja en el cuerpo).
// No existen `odontologoId` ni `prioridad`: se eliminan del estado.
// La lista lee `descripcion`, `odontologoNombre`, `fecha`/`createdAt` e ítems.

const EMPTY_ITEM = { descripcion: "", tarifa: "", total: "" };

// Formatea `fecha` (LocalDate) con respaldo en `createdAt`.
// Nunca devuelve "Invalid Date": retorna '' si ambos faltan o son inválidos.
const formatPlanFecha = (plan) => {
  for (const value of [plan?.fecha, plan?.createdAt]) {
    if (value === null || value === undefined || value === "") continue;
    const d = parseFechaLocal(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  }
  return "";
};

const extractErrorMessage = (err) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || "Error al crear plan";

const PlanTratamientoSection = ({ historiaId, readOnly }) => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [newPlan, setNewPlan] = useState({ descripcion: "", items: [] });
  const [newItem, setNewItem] = useState({ ...EMPTY_ITEM });

  useEffect(() => {
    load();
  }, [historiaId]);

  const load = async () => {
    setLoadError("");
    try {
      const res = await clinicaService.listPlanes(historiaId);
      setPlanes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setPlanes([]);
        return;
      }
      setLoadError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.descripcion?.trim()) return;

    setNewPlan({
      ...newPlan,
      items: [
        ...newPlan.items,
        {
          descripcion: newItem.descripcion.trim(),
          ...(parseCOP(newItem.tarifa) !== null ? { tarifa: parseCOP(newItem.tarifa) } : {}),
          ...(parseCOP(newItem.total) !== null ? { total: parseCOP(newItem.total) } : {}),
          _key: crypto.randomUUID(),
        },
      ],
    });

    setNewItem({ ...EMPTY_ITEM });
  };

  const handleRemoveItem = (key) => {
    setNewPlan({ ...newPlan, items: newPlan.items.filter((i) => i._key !== key) });
  };

  const handleSavePlan = async () => {
    setFormError("");
    if (!newPlan.descripcion?.trim()) {
      setFormError("La descripción del plan es obligatoria");
      return;
    }
    if (newPlan.items.length === 0) {
      setFormError("El plan debe contener al menos un ítem de tratamiento");
      return;
    }

    setSaving(true);
    try {
      const planToSave = {
        descripcion: newPlan.descripcion.trim(),
        // eslint-disable-next-line no-unused-vars
        items: newPlan.items.map(({ _key, ...item }) => item),
      };

      await clinicaService.createPlan(historiaId, planToSave);

      setNewPlan({ descripcion: "", items: [] });
      setShowForm(false);
      load();
    } catch (e) {
      setFormError(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const planTotal = (p) =>
    (p.items ?? []).reduce((acc, it) => acc + (Number(it.total) || 0), 0);

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid rgba(0, 119, 182, 0.1)",
          paddingBottom: "1rem",
          marginBottom: "2rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "var(--text-main)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <ListChecks size={24} style={{ color: "var(--primary)" }} /> Plan de
          Tratamiento
        </h3>
        {!readOnly && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            style={{
              width: "auto",
              padding: "0.6rem 1.2rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
            }}
          >
            <Plus size={18} /> Nuevo Plan
          </button>
        )}
      </div>

      {showForm && (
        <div
          style={{
            background: "var(--surface)",
            padding: "2rem",
            borderRadius: "var(--border-radius)",
            boxShadow: "var(--shadow)",
            border: "1px solid var(--border-color)",
            marginBottom: "2.5rem",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <h4
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "1.5rem",
            }}
          >
            Definir Nuevo Plan Integral
          </h4>
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type="text"
              placeholder="Descripción general del plan (Ej: Fase Inicial e Higiene)"
              value={newPlan.descripcion}
              onChange={(e) =>
                setNewPlan({ ...newPlan, descripcion: e.target.value })
              }
              style={{
                width: "100%",
                padding: "1rem",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                fontSize: "1rem",
                background: "var(--surface)",
                color: "var(--text-main)",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
            />
          </div>

          <div
            style={{
              background: "var(--background)",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              Añadir Actividades / Pasos
            </p>
            <div
              style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}
            >
              <input
                type="text"
                placeholder="Descripción de la actividad..."
                value={newItem.descripcion}
                onChange={(e) =>
                  setNewItem({ ...newItem, descripcion: e.target.value })
                }
                style={{
                  flex: "2 1 200px",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "var(--surface)",
                  color: "var(--text-main)",
                  outline: "none",
                }}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Tarifa (Ej: 150.000)"
                value={newItem.tarifa}
                onChange={(e) =>
                  setNewItem({ ...newItem, tarifa: formatCOPInput(e.target.value) })
                }
                style={{
                  flex: "1 1 100px",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "var(--surface)",
                  color: "var(--text-main)",
                  outline: "none",
                }}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Total (Ej: 150.000)"
                value={newItem.total}
                onChange={(e) =>
                  setNewItem({ ...newItem, total: formatCOPInput(e.target.value) })
                }
                style={{
                  flex: "1 1 100px",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "var(--surface)",
                  color: "var(--text-main)",
                  outline: "none",
                }}
              />
              <button
                onClick={handleAddItem}
                style={{
                  padding: "0 1.2rem",
                  background: "var(--text-main)",
                  color: "var(--surface)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Plus size={20} />
              </button>
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {newPlan.items.map((item) => (
                <li
                  key={item._key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    background: "var(--surface)",
                    padding: "0.8rem 1rem",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "0.95rem", color: "var(--text-main)", flex: 1 }}
                  >
                    {item.descripcion}
                  </span>
                  {formatCOP(item.total ?? item.tarifa) && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      $ {formatCOP(item.total ?? item.tarifa)}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveItem(item._key)}
                    style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {formError && (
            <p style={{ color: "#e63946", fontWeight: 600 }}>{formError}</p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              paddingTop: "1rem",
            }}
          >
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePlan}
              disabled={saving}
              className="btn-primary"
              style={{ width: "auto", padding: "0.8rem 1.5rem", margin: 0, opacity: saving ? 0.5 : 1 }}
            >
              {saving ? "Guardando..." : "Crear Plan Integral"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {loadError && (
          <div style={{ border: "1px solid var(--accent)", background: "rgba(230, 57, 70, 0.08)", borderRadius: "8px", padding: "0.8rem 1rem", fontSize: "0.9rem", color: "var(--text-main)" }}>
            <strong style={{ color: "var(--accent)" }}>No se pudieron cargar los planes. </strong>
            {loadError}
          </div>
        )}
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
            Cargando planes...
          </div>
        )}
        {planes.length === 0 && !loading && !showForm && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              fontStyle: "italic",
            }}
          >
            No hay planes definidos aún.
          </div>
        )}
        {planes.map((p) => (
          <div
            key={p.id}
            style={{
              background: "var(--surface)",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow)",
              transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--primary-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-color)")
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
                gap: "1rem",
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  {p.descripcion}
                </h4>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Calendar size={14} /> {formatPlanFecha(p)}
                </div>
                {p.odontologoNombre && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.3rem",
                    }}
                  >
                    <User size={14} /> Prescrito por {p.odontologoNombre}
                  </div>
                )}
              </div>
              {planTotal(p) > 0 && (
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  $ {planTotal(p).toLocaleString("es-CO")}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              {(p.items ?? []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.8rem 1rem",
                    background: "var(--background)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--text-main)",
                      flex: 1,
                    }}
                  >
                    {item.descripcion}
                  </span>
                  {formatCOP(item.tarifa) && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Tarifa: $ {formatCOP(item.tarifa)}
                    </span>
                  )}
                  {formatCOP(item.total) && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700 }}>
                      $ {formatCOP(item.total)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanTratamientoSection;
