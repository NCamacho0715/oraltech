import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Lock,
  ClipboardList,
  Activity,
  Table,
  History,
  FileCheck,
  ListChecks,
} from "lucide-react";
import clinicaService from "../services/clinicaService";
import { formatFechaCorta } from "../utils/fechas";
import {
  EmptyClinicalHistory,
  ClinicalHistoryHeader,
  ClinicalHistorySidebar,
  ClinicalHistoryTabContent,
} from "../components/clinica/ClinicalHistoryComponents";

const tabs = [
  { id: "anamnesis", label: "Anamnesis", icon: ClipboardList },
  { id: "antecedentes", label: "Antecedentes", icon: History },
  { id: "examen", label: "Examen Clínico", icon: Activity },
  { id: "odontograma", label: "Odontograma", icon: Table },
  { id: "pulpar", label: "Análisis Pulpar", icon: ClipboardList },
  { id: "periodontal", label: "Análisis Periodontal", icon: ClipboardList },
  { id: "complementario", label: "Exám. Complementarios", icon: ClipboardList },
  { id: "diagnostico", label: "Diagnostico", icon: ClipboardList },
  { id: "plan", label: "Plan de Tratamiento", icon: ListChecks },
  { id: "evoluciones", label: "Evoluciones", icon: FileCheck },
  { id: "consentimiento", label: "Consentimiento", icon: Lock },
];

const ClinicalHistory = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historia, setHistoria] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("anamnesis");

  useEffect(() => {
    let ignore = false;
    const loadHistoria = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const { data } = await clinicaService.historiaExists(patientId);
        if (ignore) return;
        if (data?.exists !== true) {
          setHistoria(null);
          setNotFound(true);
          return;
        }
        const response = await clinicaService.getHistoriaByPacienteId(patientId);
        if (ignore) return;
        setHistoria(response.data);
      } catch (err) {
        if (ignore) return;
        if (err.response?.status === 404) {
          setHistoria(null);
          setNotFound(true);
        } else {
          setError(
            err.response?.data?.message || "Error al cargar historia clínica",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistoria();
    return () => {
      ignore = true;
    };
  }, [patientId]);

  const handleCreateHistoria = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await clinicaService.createHistoria(patientId);
      setHistoria(res.data);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          const response = await clinicaService.getHistoriaByPacienteId(patientId);
          setHistoria(response.data);
          setNotFound(false);
        } catch (reloadErr) {
          setError(
            reloadErr.response?.data?.message || "Error al cargar historia clínica",
          );
        }
      } else {
        setError(
          err.response?.data?.message || "Error al crear historia clínica",
        );
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando Historia Clínica...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!historia) {
    if (!notFound) return null;
    return (
      <EmptyClinicalHistory
        handleCreateHistoria={handleCreateHistoria}
        creating={creating}
      />
    );
  }

  const isClosed = historia.estado === "CERRADA";
  const fechaAperturaTexto =
    formatFechaCorta(historia.fechaApertura || historia.createdAt) || "—";

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1650px",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <ClinicalHistoryHeader
        historia={historia}
        patientId={patientId}
        fechaAperturaTexto={fechaAperturaTexto}
        isClosed={isClosed}
        navigate={navigate}
      />

      <div
        style={{
          display: "flex",
          gap: "2rem",
          flex: 1,
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <ClinicalHistorySidebar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <ClinicalHistoryTabContent
          activeTab={activeTab}
          historiaId={historia.id}
          patientId={patientId}
          isClosed={isClosed}
        />
      </div>
    </div>
  );
};

export default ClinicalHistory;
