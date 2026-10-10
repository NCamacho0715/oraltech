import React, { useState, useEffect } from "react";
import clinicaService from "../../services/clinicaService";
import { useBloqueoSeccion } from "../../hooks/useBloqueoSeccion";
import DesbloqueoModal from "../../components/clinica/DesbloqueoModal";
import { formatFechaCorta } from "../../utils/fechas";
import {
  ColumnaIzquierdaAntecedentes,
  ColumnaDerechaAntecedentes,
  AntecedentesFooter,
} from "../../components/clinica/AntecedentesCols";

const INITIAL_ANTECEDENTES = {
  famCardiacos: false,
  famDiabetes: false,
  famHipertension: false,
  famCancer: false,
  famEpilepsia: false,
  famOtros: "",
  hepatitis: false,
  fiebreReumatica: false,
  patDiabetes: false,
  ulcera: false,
  patEpilepsia: false,
  patHipertension: false,
  convulsiones: false,
  alergias: "",
  mareos: false,
  fracturas: false,
  hemorragias: false,
  cicatrizacion: false,
  infartos: false,
  valvulas: false,
  renales: false,
  respiratorios: false,
  vih: false,
  fuma: false,
  alcohol: false,
  cafe: "",
  medicamentos: "",
  alergiaMedicamentos: "",
  alergiaAnestesia: false,
  tratamiento: false,
  embarazo: false,
  mesesEmbarazo: 0,
  cirugias: false,
  transfusiones: false,
  luxacion: false,
  amigdalitis: false,
  infecciones: false,
  halitosis: false,
  fuegos: false,
  cepilladoFreq: 1,
  sedaFreq: "a veces",
  otrosHabitos: "",
  ultimaVisita: "",
  motivoVisita: "",
  observaciones: "",
};

const AntecedentesBanners = ({
  patientError,
  loadError,
  bloqueo,
  fechaBloqueo,
  meta,
}) => (
  <>
    {patientError && (
      <div
        style={{
          border: "1px solid var(--accent)",
          background: "rgba(230, 57, 70, 0.08)",
          borderRadius: "8px",
          padding: "0.8rem 1rem",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--text-main)",
        }}
      >
        <strong style={{ color: "var(--accent)" }}>
          No se pudo verificar el sexo del paciente.{" "}
        </strong>
        {patientError} El formulario está en solo lectura.
      </div>
    )}
    {loadError && (
      <div
        style={{
          border: "1px solid var(--accent)",
          background: "rgba(230, 57, 70, 0.08)",
          borderRadius: "8px",
          padding: "0.8rem 1rem",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--text-main)",
        }}
      >
        <strong style={{ color: "var(--accent)" }}>
          No se pudieron cargar los antecedentes.{" "}
        </strong>
        {loadError}
      </div>
    )}
    {bloqueo.bloqueado && (
      <div
        style={{
          border: "1px solid var(--border-color)",
          background: "var(--surface)",
          borderRadius: "8px",
          padding: "0.8rem 1rem",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--text-main)",
        }}
      >
        <strong>Registro bloqueado.</strong>
        {fechaBloqueo ? ` Registrado el ${fechaBloqueo}` : ""}
        {(meta.updatedBy || meta.createdBy) ? ` por ${meta.updatedBy || meta.createdBy}` : ""} Solo un ADMIN puede
        desbloquearlo para corregir un error de digitación.
      </div>
    )}
    {!bloqueo.bloqueado && bloqueo.desbloqueo && (
      <div
        style={{
          border: "1px solid var(--border-color)",
          background: "var(--surface)",
          borderRadius: "8px",
          padding: "0.8rem 1rem",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--text-main)",
        }}
      >
        Desbloqueada por {bloqueo.desbloqueo.por}: {bloqueo.desbloqueo.motivo}
      </div>
    )}
  </>
);

const AntecedentesForm = ({ historiaId, patientId, readOnly }) => {
  const [data, setData] = useState(INITIAL_ANTECEDENTES);
  const [hasCafe, setHasCafe] = useState(false);
  const [hasMed, setHasMed] = useState(false);
  const [hasAlergiaMed, setHasAlergiaMed] = useState(false);
  const [hasFamOtros, setHasFamOtros] = useState(false);
  const [hasAlergias, setHasAlergias] = useState(false);

  const [patientSex, setPatientSex] = useState(null);
  const [patientBlocked, setPatientBlocked] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // HU-2: bloqueo de sección inmutable + desbloqueo excepcional ADMIN.
  const bloqueo = useBloqueoSeccion("antecedentes");
  const { marcarRegistrado } = bloqueo;
  const [meta, setMeta] = useState({ createdAt: "", createdBy: "" });

  // Fail-safe: si no se pudo cargar el paciente, el formulario queda en solo lectura.
  // HU-2: también queda bloqueado si la sección ya tiene un registro guardado.
  const locked = readOnly || patientBlocked || bloqueo.bloqueado;

  useEffect(() => {
    let ignore = false;

    const loadAntecedentes = async () => {
      try {
        const res = await clinicaService.getAntecedentes(historiaId);
        if (ignore) return;

        if (res.data) {
          const cleanData = {};

          Object.keys(res.data).forEach((key) => {
            if (res.data[key] !== null) {
              cleanData[key] = res.data[key];
            }
          });

          if (res.data.cafe) setHasCafe(true);
          if (res.data.medicamentos) setHasMed(true);
          if (res.data.alergiaMedicamentos) {
            setHasAlergiaMed(true);
          }
          if (res.data.famOtros) {
            setHasFamOtros(true);
            if (res.data.famOtros === "true" || res.data.famOtros === true) {
              cleanData.famOtros = "";
            }
          }
          if (res.data.alergias) {
            setHasAlergias(true);
            if (res.data.alergias === "true" || res.data.alergias === true) {
              cleanData.alergias = "";
            }
          }

          setData((prev) => ({ ...prev, ...cleanData }));

          // HU-2: si ya existe registro, la sección queda bloqueada.
          if (res.data.id) {
            marcarRegistrado(res.data);
            setMeta({
              createdAt: res.data.createdAt || "",
              createdBy: res.data.createdBy || "",
              updatedAt: res.data.updatedAt || "",
              updatedBy: res.data.updatedBy || "",
            });
          }
        }
      } catch (err) {
        if (ignore) return;
        // 404 = "sin antecedentes aún": estado vacío, no error.
        if (err?.response?.status === 404) return;
        setLoadError(
          err?.response?.data?.message ||
            err?.message ||
            "No se pudieron cargar los antecedentes",
        );
      }
    };

    const loadPatient = async () => {
      try {
        const { data: patient } = await clinicaService.getPatientById(patientId);
        if (ignore) return;
        setPatientSex(patient?.sex ?? null);
      } catch (err) {
        if (ignore) return;
        // Sin sexo confiable no se puede decidir sobre "Embarazada": bloquear edición.
        setPatientBlocked(true);
        setPatientError(
          err?.response?.data?.message ||
            err?.message ||
            "No se pudo cargar el sexo del paciente",
        );
      }
    };

    loadAntecedentes();
    loadPatient();

    return () => {
      ignore = true;
    };
  }, [historiaId, patientId, marcarRegistrado]);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const finalData = { ...data };
    if (!hasCafe) finalData.cafe = "";
    if (!hasMed) finalData.medicamentos = "";
    if (!hasAlergiaMed) finalData.alergiaMedicamentos = "";
    if (!hasFamOtros) finalData.famOtros = "";
    if (!hasAlergias) finalData.alergias = "";
    try {
      const res = await clinicaService.upsertAntecedentes(
        historiaId,
        finalData,
      );
      if (res?.data) {
        setMeta({
          createdAt: res.data.createdAt || "",
          createdBy: res.data.createdBy || "",
          updatedAt: res.data.updatedAt || "",
          updatedBy: res.data.updatedBy || "",
        });
      }
      // HU-2: tras guardar, la sección queda bloqueada.
      bloqueo.marcarGuardado();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // HU-2: 409 = el backend ya la bloqueó: reflejarlo sin falso "Guardado".
      if (err?.response?.status === 409) bloqueo.marcarConflicto();
      setSaveError(
        err?.response?.data?.message || err?.message || "Error al guardar",
      );
    } finally {
      setSaving(false);
    }
  };

  const commonInputStyle = {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid var(--primary)",
    borderRadius: "6px",
    background: "var(--surface)",
    color: "var(--text-main)",
    fontSize: "0.85rem",
  };

  // HU-2: fecha del registro bloqueado ('' si falta o es inválida, nunca 'Invalid Date').
  const fechaBloqueo = formatFechaCorta(meta.updatedAt || meta.createdAt);

  return (
    <form onSubmit={handleSubmit} style={{ animation: "fadeIn 0.4s ease-out", width: "100%" }}>
      <h3
        style={{
          fontSize: "1.4rem",
          fontWeight: 600,
          color: "var(--text-main)",
          borderBottom: "2px solid var(--border-color)",
          paddingBottom: "1rem",
          marginBottom: "2rem",
        }}
      >
        Antecedentes Médico - Odontológicos
      </h3>

      <AntecedentesBanners
        patientError={patientError}
        loadError={loadError}
        bloqueo={bloqueo}
        fechaBloqueo={fechaBloqueo}
        meta={meta}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2.5rem",
        }}
      >
        <ColumnaIzquierdaAntecedentes
          data={data}
          handleChange={handleChange}
          locked={locked}
          commonInputStyle={commonInputStyle}
          hasFamOtros={hasFamOtros}
          setHasFamOtros={setHasFamOtros}
          hasAlergias={hasAlergias}
          setHasAlergias={setHasAlergias}
        />
        <ColumnaDerechaAntecedentes
          data={data}
          handleChange={handleChange}
          locked={locked}
          commonInputStyle={commonInputStyle}
          hasCafe={hasCafe}
          setHasCafe={setHasCafe}
          hasMed={hasMed}
          setHasMed={setHasMed}
          hasAlergiaMed={hasAlergiaMed}
          setHasAlergiaMed={setHasAlergiaMed}
          patientSex={patientSex}
        />
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        <label
          htmlFor="antecedentes-observaciones"
          style={{
            display: "block",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--primary)",
            marginBottom: "1rem",
          }}
        >
          Observaciones Extra
        </label>
        <textarea
          id="antecedentes-observaciones"
          value={data.observaciones}
          onChange={(e) => handleChange("observaciones", e.target.value)}
          readOnly={locked}
          style={{
            width: "100%",
            padding: "1rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            minHeight: "100px",
            fontSize: "1rem",
            fontFamily: "inherit",
            outline: "none",
            background: "var(--surface)",
            color: "var(--text-main)",
            resize: "vertical",
          }}
          placeholder="Observaciones adicionales..."
        />
      </section>

      <AntecedentesFooter
        locked={locked}
        saving={saving}
        saveError={saveError}
        saved={saved}
        readOnly={readOnly}
        bloqueo={bloqueo}
      />

      <DesbloqueoModal
        abierto={bloqueo.showUnlock}
        seccionNombre="Antecedentes"
        onConfirm={(motivo) => bloqueo.solicitar(historiaId, motivo)}
        onCancel={() => bloqueo.setShowUnlock(false)}
        error={bloqueo.unlockError}
        enviando={bloqueo.unlocking}
      />
    </form>
  );
};

export default AntecedentesForm;
