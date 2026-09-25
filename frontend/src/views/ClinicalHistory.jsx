import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  Lock,
  ClipboardList,
  Activity,
  Table,
  History,
  FileCheck,
  ListChecks,
} from "lucide-react";
import clinicaService from "../services/clinicaService";
import AnamnesisForm from "./sections/AnamnesisForm";
import AntecedentesForm from "./sections/AntecedentesForm";
import ExamenClinicoForm from "./sections/ExamenClinicoForm";
import OdontogramaSection from "./sections/OdontogramaSection";
import AnalisisPulparForm from "./sections/AnalisisPulparForm";
import AnalisisPeriodontalForm from "./sections/AnalisisPeriodontalForm";
import EvolucionesSection from "./sections/EvolucionesSection";
import ConsentimientoSection from "./sections/ConsentimientoSection";
import DiagnosticoTab from "./sections/DiagnosticoTab";
import PlanTratamientoSection from "./sections/PlanTratamientoSection";

const ClinicalHistory = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historia, setHistoria] = useState(null);
  const [activeTab, setActiveTab] = useState("anamnesis");

  useEffect(() => {
    const loadHistoria = async () => {
      try {
        setLoading(true);
        // Try to find if user has one
        const response =
          await clinicaService.getHistoriaByPacienteId(patientId);
        setHistoria(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          // Create new one if not found
          try {
            const newHistory = await clinicaService.createHistoria(patientId);
            setHistoria(newHistory.data);
          } catch (createErr) {
            setError(
              "Error al crear historia clínica: " +
                (createErr.response?.data?.message || "Error desconocido"),
            );
          }
        } else {
          setError("Error al cargar historia clínica");
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistoria();
  }, [patientId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando Historia Clínica...
      </div>
    );
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const isClosed = historia.estado === "CERRADA";

  const tabs = [
    { id: "anamnesis", label: "Anamnesis", icon: ClipboardList },
    { id: "antecedentes", label: "Antecedentes", icon: History },
    { id: "examen", label: "Examen Clínico", icon: Activity },
    { id: "odontograma", label: "Odontograma", icon: Table },
    { id: "pulpar", label: "Análisis Pulpar", icon: ClipboardList },
    { id: "periodontal", label: "Análisis Periodontal", icon: ClipboardList },
    { id: "diagnostico", label: "Diagnostico", icon: ClipboardList },
    { id: "plan", label: "Plan de Tratamiento", icon: ListChecks },
    { id: "evoluciones", label: "Evoluciones", icon: FileCheck },
    { id: "consentimiento", label: "Consentimiento", icon: Lock },
  ];

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              border: "none",
              background: "var(--secondary-soft)",
              color: "var(--primary)",
              padding: "0.6rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Volver"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1
              style={{
                color: "var(--text-main)",
                fontSize: "2.2rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              Historia Clínica
              {isClosed && (
                <span
                  style={{
                    background: "#fee2e2",
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  Cerrada
                </span>
              )}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              ID Historia: {historia.id}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/patients/${patientId}`)}
          style={{
            background: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--primary)",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          Ver Ficha del Paciente
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          flex: 1,
          alignItems: "flex-start",
        }}
      >
        {/* Navigation Sidebar (Vertical Tabs) */}
        <nav
          className="auth-card"
          style={{
            width: "280px",
            flexShrink: 0,
            padding: "1.5rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.3s ease",
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  textAlign: "left",
                }}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <section
          className="auth-card"
          style={{
            flex: 1,
            padding: "2.5rem",
            minHeight: "600px",
            width: "100%",
          }}
        >
          {activeTab === "anamnesis" && (
            <AnamnesisForm historiaId={historia.id} readOnly={isClosed} />
          )}
          {activeTab === "antecedentes" && (
            <AntecedentesForm
              historiaId={historia.id}
              patientId={patientId}
              readOnly={isClosed}
            />
          )}
          {activeTab === "examen" && (
            <ExamenClinicoForm historiaId={historia.id} readOnly={isClosed} />
          )}
          {activeTab === "odontograma" && (
            <OdontogramaSection historiaId={historia.id} readOnly={isClosed} />
          )}
          {activeTab === "pulpar" && (
            <AnalisisPulparForm historiaId={historia.id} readOnly={isClosed} />
          )}
          {activeTab === "periodontal" && (
            <AnalisisPeriodontalForm
              historiaId={historia.id}
              readOnly={isClosed}
            />
          )}
          {activeTab === "diagnostico" && (
            <DiagnosticoTab historiaId={historia.id} readOnly={isClosed} />
          )}
          {activeTab === "plan" && (
            <PlanTratamientoSection
              historiaId={historia.id}
              readOnly={isClosed}
            />
          )}
          {activeTab === "evoluciones" && (
            <EvolucionesSection historiaId={historia.id} readOnly={isClosed} />
          )}
          {activeTab === "consentimiento" && (
            <ConsentimientoSection
              historiaId={historia.id}
              readOnly={isClosed}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default ClinicalHistory;
