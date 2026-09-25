import React, { useState, useEffect } from "react";
import { Plus, ListChecks, Calendar, Trash2 } from "lucide-react";
import clinicaService from "../../services/clinicaService";

const PlanTratamientoSection = ({ historiaId, readOnly }) => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ descripcion: "", items: [] });
  const [newItem, setNewItem] = useState({
    descripcion: "",
    prioridad: "BAJA",
  });

  useEffect(() => {
    load();
  }, [historiaId]);

  const load = async () => {
    try {
      const res = await clinicaService.listPlanes(historiaId);
      setPlanes(res.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.descripcion) return;

    setNewPlan({
      ...newPlan,
      items: [
        ...newPlan.items,
        {
          ...newItem,
          _key: crypto.randomUUID(),
        },
      ],
    });

    setNewItem({ descripcion: "", prioridad: "BAJA" });
  };

  const handleSavePlan = async () => {
    if (!newPlan.descripcion || newPlan.items.length === 0) {
      alert("Descripción y al menos un item requeridos");
      return;
    }

    try {
      const planToSave = {
        descripcion: newPlan.descripcion,
        items: newPlan.items.map(({ _key, ...item }) => item),
      };

      await clinicaService.createPlan(historiaId, planToSave);

      setNewPlan({ descripcion: "", items: [] });
      setShowForm(false);
      load();
    } catch (e) {
      alert("Error al crear plan");
    }
  };

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
            border: "1px solid #90e0ef",
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
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                background: "#f8fbff",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
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
              style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
            >
              <input
                type="text"
                placeholder="Descripción de la actividad..."
                value={newItem.descripcion}
                onChange={(e) =>
                  setNewItem({ ...newItem, descripcion: e.target.value })
                }
                style={{
                  flex: 1,
                  padding: "0.8rem 1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
              <select
                value={newItem.prioridad}
                onChange={(e) =>
                  setNewItem({ ...newItem, prioridad: e.target.value })
                }
                style={{
                  padding: "0.8rem 1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "#ffffff",
                  outline: "none",
                  minWidth: "120px",
                }}
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
              <button
                onClick={handleAddItem}
                style={{
                  padding: "0 1.2rem",
                  background: "var(--text-main)",
                  color: "white",
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
                    background: "#ffffff",
                    padding: "0.8rem 1rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "0.95rem", color: "var(--text-main)" }}
                  >
                    {item.descripcion}
                  </span>
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background:
                        item.prioridad === "ALTA"
                          ? "#fee2e2"
                          : item.prioridad === "MEDIA"
                            ? "#fef3c7"
                            : "#f1f5f9",
                      color:
                        item.prioridad === "ALTA"
                          ? "#ef4444"
                          : item.prioridad === "MEDIA"
                            ? "#d97706"
                            : "#64748b",
                    }}
                  >
                    {item.prioridad}
                  </span>
                </li>
              ))}
            </ul>
          </div>

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
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePlan}
              className="btn-primary"
              style={{ width: "auto", padding: "0.8rem 1.5rem", margin: 0 }}
            >
              Crear Plan Integral
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {planes.length === 0 && !loading && !showForm && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              background: "var(--surface)",
              color: "#94a3b8",
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
              border: "1px solid #e2e8f0",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--primary-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#e2e8f0")
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
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
                  <Calendar size={14} />{" "}
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              {p.items.map((item) => (
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
                      background:
                        item.prioridad === "ALTA"
                          ? "#ef4444"
                          : item.prioridad === "MEDIA"
                            ? "#f59e0b"
                            : "#94a3b8",
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
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      fontStyle: "italic",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.prioridad}
                  </span>
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
