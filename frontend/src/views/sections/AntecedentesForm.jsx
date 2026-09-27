import React, { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle } from "lucide-react";
import clinicaService from "../../services/clinicaService";
import { useBloqueoSeccion } from "../../hooks/useBloqueoSeccion";
import DesbloqueoModal from "../../components/clinica/DesbloqueoModal";
import { formatFechaCorta } from "../../utils/fechas";

// Component defined OUTSIDE to avoid re-mounting on each parent render
const CheckboxRow = ({
  label,
  field,
  children,
  checked,
  onToggle,
  readOnly,
  data,
  onChange,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        padding: "0.6rem 0.8rem",
        background: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        cursor: readOnly ? "default" : "pointer",
        userSelect: "none",
        minHeight: "45px",
        width: "100%",
        opacity: readOnly ? 0.8 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked !== undefined ? checked : data[field] || false}
        onChange={(e) => {
          if (readOnly) return;
          if (onToggle) {
            onToggle(e.target.checked);
          } else {
            onChange(field, e.target.checked);
          }
        }}
        disabled={readOnly}
        style={{
          width: "16px",
          height: "16px",
          flexShrink: 0,
          accentColor: "var(--primary)",
        }}
      />
      <span
        style={{
          fontSize: "0.9rem",
          fontWeight: 500,
          color: "var(--text-main)",
          lineHeight: "1.2",
        }}
      >
        {label}
      </span>
    </label>
    {(checked !== undefined ? checked : data[field]) && children && (
      <div style={{ paddingLeft: "0.5rem" }}>{children}</div>
    )}
  </div>
);

const AntecedentesForm = ({ historiaId, patientId, readOnly }) => {
  const [data, setData] = useState({
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
  });

  const [hasCafe, setHasCafe] = useState(false);
  const [hasMed, setHasMed] = useState(false);
  const [hasAlergiaMed, setHasAlergiaMed] = useState(false);

  const [patientSex, setPatientSex] = useState(null);
  const [patientBlocked, setPatientBlocked] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // HU-2: bloqueo de sección inmutable + desbloqueo excepcional ADMIN.
  const bloqueo = useBloqueoSeccion("antecedentes");
  const [meta, setMeta] = useState({ createdAt: "", createdBy: "" });

  // Fail-safe: si no se pudo cargar el paciente, el formulario queda en solo lectura.
  // HU-2: también queda bloqueado si la sección ya tiene un registro guardado.
  const locked = readOnly || patientBlocked || bloqueo.bloqueado;

  const loadAntecedentes = useCallback(async () => {
    try {
      const res = await clinicaService.getAntecedentes(historiaId);

      if (res.data) {
        const cleanData = {};

        Object.keys(res.data).forEach((key) => {
          if (res.data[key] !== null) {
            cleanData[key] = res.data[key];
          }
        });

        setData((prev) => ({ ...prev, ...cleanData }));

        if (res.data.cafe) setHasCafe(true);
        if (res.data.medicamentos) setHasMed(true);
        if (res.data.alergiaMedicamentos) {
          setHasAlergiaMed(true);
        }

        // HU-2: si ya existe registro, la sección queda bloqueada.
        if (res.data.id) {
          bloqueo.marcarRegistrado(res.data);
          setMeta({
            createdAt: res.data.createdAt || "",
            createdBy: res.data.createdBy || "",
          });
        }
      }
    } catch (err) {
      // 404 = "sin antecedentes aún": estado vacío, no error.
      if (err?.response?.status === 404) return;
      setLoadError(
        err?.response?.data?.message || err?.message || "No se pudieron cargar los antecedentes",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historiaId]);

  const loadPatient = useCallback(async () => {
    try {
      const { data: patient } = await clinicaService.getPatientById(patientId);
      setPatientSex(patient?.sex ?? null);
    } catch (err) {
      // Sin sexo confiable no se puede decidir sobre "Embarazada": bloquear edición.
      setPatientBlocked(true);
      setPatientError(
        err?.response?.data?.message || err?.message || "No se pudo cargar el sexo del paciente",
      );
    }
  }, [patientId]);

  useEffect(() => {
    loadAntecedentes();
    loadPatient();
  }, [loadAntecedentes, loadPatient]);

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
    try {
      const res = await clinicaService.upsertAntecedentes(historiaId, finalData);
      if (res?.data) {
        setMeta({
          createdAt: res.data.createdAt || "",
          createdBy: res.data.createdBy || "",
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
  const fechaBloqueo = formatFechaCorta(meta.createdAt);

  return (
    <form onSubmit={handleSubmit} style={{ animation: "fadeIn 0.4s ease-out" }}>
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

      {/* HU-2: estado de bloqueo de la sección */}
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
          {meta.createdBy ? ` por ${meta.createdBy}` : ""} Solo un ADMIN puede
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2.5rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h4
              style={{
                color: "var(--primary)",
                marginBottom: "1rem",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Antecedentes Familiares
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
              }}
            >
              <CheckboxRow
                label="Afecciones Cardíacas"
                field="famCardiacos"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Diabetes"
                field="famDiabetes"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Hipertensión"
                field="famHipertension"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Cáncer"
                field="famCancer"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Epilepsia"
                field="famEpilepsia"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Otros"
                field="famOtros"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              >
                <input
                  type="text"
                  placeholder="Especificar..."
                  value={data.famOtros}
                  disabled={locked}
                  onChange={(e) => handleChange("famOtros", e.target.value)}
                  style={commonInputStyle}
                />
              </CheckboxRow>
            </div>
          </section>

          <section>
            <h4
              style={{
                color: "var(--primary)",
                marginBottom: "1rem",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Antecedentes Patológicos
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
              }}
            >
              <CheckboxRow
                label="Hepatitis"
                field="hepatitis"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Fiebre Neumática"
                field="fiebreReumatica"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Diabetes"
                field="patDiabetes"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Úlcera / Hernia Hiatal"
                field="ulcera"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Epilepsia"
                field="patEpilepsia"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Tensión Arterial Alta"
                field="patHipertension"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Convulsiones"
                field="convulsiones"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Alergias"
                field="alergias"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              >
                <input
                  type="text"
                  placeholder="Tipo de alergia..."
                  value={data.alergias}
                  disabled={locked}
                  onChange={(e) => handleChange("alergias", e.target.value)}
                  style={commonInputStyle}
                />
              </CheckboxRow>
              <CheckboxRow
                label="Mareos"
                field="mareos"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Fracturas / Accidentes"
                field="fracturas"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Hemorragias"
                field="hemorragias"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Cicatriza Normalmente"
                field="cicatrizacion"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Infartos / Anginas"
                field="infartos"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Reemplazo de Válvulas"
                field="valvulas"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Problemas Renales"
                field="renales"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Respiratorios / Asma"
                field="respiratorios"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="VIH"
                field="vih"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
            </div>
          </section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h4
              style={{
                color: "var(--primary)",
                marginBottom: "1rem",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Antecedentes Toxicológicos
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
              }}
            >
              <CheckboxRow
                label="Fuma"
                field="fuma"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Bebe Alcohol"
                field="alcohol"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Ingiere Café y/o Té"
                checked={hasCafe}
                onToggle={setHasCafe}
                data={data}
                readOnly={locked}
              >
                <input
                  type="text"
                  value={data.cafe}
                  disabled={locked}
                  onChange={(e) => handleChange("cafe", e.target.value)}
                  placeholder="Frecuencia..."
                  style={commonInputStyle}
                />
              </CheckboxRow>
              <CheckboxRow
                label="Toma Medicamentos"
                checked={hasMed}
                onToggle={setHasMed}
                data={data}
                readOnly={locked}
              >
                <input
                  type="text"
                  value={data.medicamentos}
                  disabled={locked}
                  onChange={(e) => handleChange("medicamentos", e.target.value)}
                  placeholder="¿Cuáles?"
                  style={commonInputStyle}
                />
              </CheckboxRow>
              <CheckboxRow
                label="Alérgico a Medicamentos"
                checked={hasAlergiaMed}
                onToggle={setHasAlergiaMed}
                data={data}
                readOnly={locked}
              >
                <input
                  type="text"
                  value={data.alergiaMedicamentos}
                  disabled={locked}
                  onChange={(e) =>
                    handleChange("alergiaMedicamentos", e.target.value)
                  }
                  placeholder="¿A cuáles?"
                  style={commonInputStyle}
                />
              </CheckboxRow>
              <CheckboxRow
                label="Alergia Anestesia"
                field="alergiaAnestesia"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
            </div>
          </section>

          <section>
            <h4
              style={{
                color: "var(--primary)",
                marginBottom: "1rem",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Médicos Personales
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
              }}
            >
              <CheckboxRow
                label="Tratamiento Médico"
                field="tratamiento"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              {patientSex === "F" && (
                <CheckboxRow
                  label="Embarazada"
                  field="embarazo"
                  data={data}
                  onChange={handleChange}
                  readOnly={locked}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <label style={{ fontSize: "0.8rem" }}>Meses:</label>
                    <input
                      type="number"
                      value={data.mesesEmbarazo}
                      disabled={locked}
                      onChange={(e) =>
                        handleChange("mesesEmbarazo", parseInt(e.target.value))
                      }
                      style={{ ...commonInputStyle, width: "60px" }}
                    />
                  </div>
                </CheckboxRow>
              )}
              <CheckboxRow
                label="Cirugías"
                field="cirugias"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Transfusiones"
                field="transfusiones"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
            </div>
          </section>

          <section>
            <h4
              style={{
                color: "var(--primary)",
                marginBottom: "1rem",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Antecedentes Estomatológicos
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              <CheckboxRow
                label="Luxación Mandíbula"
                field="luxacion"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Amigdalitis"
                field="amigdalitis"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Infecciones Orales"
                field="infecciones"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Halitosis / Acidez"
                field="halitosis"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
              <CheckboxRow
                label="Fuegos / Herpes"
                field="fuegos"
                data={data}
                onChange={handleChange}
                readOnly={locked}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Cepillado (día)</label>
                <select
                  value={data.cepilladoFreq}
                  disabled={locked}
                  onChange={(e) =>
                    handleChange("cepilladoFreq", parseInt(e.target.value))
                  }
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3 o más</option>
                </select>
              </div>
              <div className="form-group">
                <label>Seda Dental</label>
                <select
                  value={data.sedaFreq}
                  disabled={locked}
                  onChange={(e) => handleChange("sedaFreq", e.target.value)}
                >
                  <option value="1">1 vez al día</option>
                  <option value="2">2 o más</option>
                  <option value="no uso">No uso</option>
                  <option value="a veces">A veces</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Otros aditamentos higiene</label>
              <input
                type="text"
                value={data.otrosHabitos}
                disabled={locked}
                onChange={(e) => handleChange("otrosHabitos", e.target.value)}
                placeholder="¿Cuál?"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Última visita odontol.</label>
                <input
                  type="text"
                  value={data.ultimaVisita}
                  disabled={locked}
                  onChange={(e) => handleChange("ultimaVisita", e.target.value)}
                  placeholder="Fecha..."
                />
              </div>
              <div className="form-group">
                <label>Motivo</label>
                <input
                  type="text"
                  value={data.motivoVisita}
                  disabled={locked}
                  onChange={(e) => handleChange("motivoVisita", e.target.value)}
                  placeholder="Ej. Dolor..."
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        <label
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

      {!locked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            paddingTop: "1.5rem",
            borderTop: "2px solid var(--border-color)",
            marginTop: "2rem",
          }}
        >
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{
              width: "auto",
              padding: "0.8rem 2.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: saving ? 0.7 : 1,
              margin: 0,
            }}
          >
            <Save size={18} />{" "}
            {saving ? "Guardando..." : "Guardar Antecedentes"}
          </button>
          {saveError && (
            <span style={{ color: "var(--accent)", fontWeight: 500 }}>
              {saveError}
            </span>
          )}
          {saved && (
            <span style={{ color: "var(--success)", fontWeight: 500 }}>
              <CheckCircle size={18} /> Guardado
            </span>
          )}
        </div>
      )}
      {/* HU-2: desbloqueo excepcional, solo ADMIN */}
      {!readOnly && bloqueo.bloqueado && bloqueo.isAdmin && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            paddingTop: "1.5rem",
            borderTop: "2px solid var(--border-color)",
            marginTop: "2rem",
          }}
        >
          <button
            type="button"
            onClick={() => bloqueo.setShowUnlock(true)}
            style={{
              width: "auto",
              padding: "0.8rem 2.5rem",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              background: "transparent",
              color: "var(--text-main)",
              fontWeight: 700,
              cursor: "pointer",
              margin: 0,
            }}
          >
            Desbloquear (ADMIN)
          </button>
        </div>
      )}
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
