import React from "react";
import { ChevronLeft } from "lucide-react";
import { formatFechaHora } from "../../utils/fechas";
import AnamnesisForm from "../../views/sections/AnamnesisForm";
import AntecedentesForm from "../../views/sections/AntecedentesForm";
import ExamenClinicoForm from "../../views/sections/ExamenClinicoForm";
import OdontogramaSection from "../../views/sections/OdontogramaSection";
import AnalisisPulparForm from "../../views/sections/AnalisisPulparForm";
import AnalisisPeriodontalForm from "../../views/sections/AnalisisPeriodontalForm";
import ExamenComplementarioForm from "../../views/sections/ExamenComplementarioForm";
import EvolucionesSection from "../../views/sections/EvolucionesSection";
import ConsentimientoSection from "../../views/sections/ConsentimientoSection";
import DiagnosticoTab from "../../views/sections/DiagnosticoTab";
import PlanTratamientoSection from "../../views/sections/PlanTratamientoSection";

export const EmptyClinicalHistory = ({ handleCreateHistoria, creating }) => (
  <div
    style={{
      padding: "2rem",
      maxWidth: "640px",
      margin: "4rem auto",
      textAlign: "center",
    }}
  >
    <div
      className="auth-card"
      style={{ padding: "3rem 2rem", borderRadius: "16px" }}
    >
      <h1
        style={{
          color: "var(--text-main)",
          fontSize: "1.6rem",
          fontWeight: 700,
          marginBottom: "1rem",
        }}
      >
        Sin historia clínica
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Este paciente aún no tiene historia clínica registrada.
      </p>
      <button
        onClick={handleCreateHistoria}
        disabled={creating}
        className="btn-primary"
        style={{
          width: "auto",
          padding: "0.8rem 2rem",
          margin: "0 auto",
          opacity: creating ? 0.7 : 1,
        }}
      >
        {creating ? "Creando..." : "Crear historia clínica"}
      </button>
    </div>
  </div>
);

export const ClinicalHistoryHeader = ({
  historia,
  patientId,
  fechaAperturaTexto,
  isClosed,
  navigate,
}) => (
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
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            marginTop: "0.3rem",
          }}
        >
          Estado:{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {historia.estado || "—"}
          </strong>
          {"  ·  "}Apertura:{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {fechaAperturaTexto}
          </strong>
          {"  ·  "}Aperturada por:{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {historia.odontologoNombre || "—"}
          </strong>
        </p>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginTop: "0.3rem",
          }}
          title="Profesional responsable y fecha de la última modificación"
        >
          Última modificación:{" "}
          {formatFechaHora(historia.updatedAt || historia.createdAt)}
          {(historia.updatedBy || historia.createdBy) && (
            <> · {historia.updatedBy || historia.createdBy}</>
          )}
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
);

export const ClinicalHistorySidebar = ({ tabs, activeTab, setActiveTab }) => (
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
            transition:
              "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
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
);

export const ClinicalHistoryTabContent = ({
  activeTab,
  historiaId,
  patientId,
  isClosed,
}) => (
  <section
    className="auth-card"
    style={{
      flex: 1,
      minWidth: 0,
      padding: "2.5rem",
      minHeight: "600px",
      width: "100%",
    }}
  >
    {activeTab === "anamnesis" && (
      <AnamnesisForm historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "antecedentes" && (
      <AntecedentesForm
        historiaId={historiaId}
        patientId={patientId}
        readOnly={isClosed}
      />
    )}
    {activeTab === "examen" && (
      <ExamenClinicoForm historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "odontograma" && (
      <OdontogramaSection historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "pulpar" && (
      <AnalisisPulparForm historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "periodontal" && (
      <AnalisisPeriodontalForm historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "complementario" && (
      <ExamenComplementarioForm historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "diagnostico" && (
      <DiagnosticoTab historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "plan" && (
      <PlanTratamientoSection historiaId={historiaId} readOnly={isClosed} />
    )}
    {activeTab === "evoluciones" && (
      <EvolucionesSection
        historiaId={historiaId}
        patientId={patientId}
        readOnly={isClosed}
      />
    )}
    {activeTab === "consentimiento" && (
      <ConsentimientoSection historiaId={historiaId} readOnly={isClosed} />
    )}
  </section>
);
