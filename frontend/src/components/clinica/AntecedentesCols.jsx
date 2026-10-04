import React from 'react';
import { Save, CheckCircle } from "lucide-react";

const toBoolean = (val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.trim().toLowerCase() === "true";
  return Boolean(val);
};

export const CheckboxRow = ({
  label,
  field,
  children,
  checked,
  onToggle,
  readOnly,
  data,
  onChange,
}) => {
  const isChecked = toBoolean(
    checked !== undefined ? checked : (field && data ? data[field] : false)
  );

  return (
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
          checked={isChecked}
          onChange={(e) => {
            if (readOnly) return;
            if (onToggle) {
              onToggle(e.target.checked);
            } else if (onChange && field) {
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
      {isChecked && children && (
        <div style={{ paddingLeft: "0.5rem" }}>{children}</div>
      )}
    </div>
  );
};

export const ColumnaIzquierdaAntecedentes = ({
  data,
  handleChange,
  locked,
  commonInputStyle,
  hasFamOtros,
  setHasFamOtros,
  hasAlergias,
  setHasAlergias,
}) => (
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
          checked={hasFamOtros}
          onToggle={setHasFamOtros}
          data={data}
          readOnly={locked}
        >
          <input
            type="text"
            placeholder="Especificar..."
            aria-label="Especificar otros antecedentes familiares"
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
          checked={hasAlergias}
          onToggle={setHasAlergias}
          data={data}
          readOnly={locked}
        >
          <input
            type="text"
            placeholder="Tipo de alergia..."
            aria-label="Tipo de alergia"
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
);

export const AntecedentesToxicologicos = ({
  data,
  handleChange,
  locked,
  commonInputStyle,
  hasCafe,
  setHasCafe,
  hasMed,
  setHasMed,
  hasAlergiaMed,
  setHasAlergiaMed,
}) => (
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
            aria-label="Frecuencia de consumo de café o té"
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
            aria-label="Medicamentos que toma actualmente"
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
            aria-label="Medicamentos a los cuales presenta alergia"
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
);

export const AntecedentesMedicosPersonales = ({
  data,
  handleChange,
  locked,
  patientSex,
  commonInputStyle,
}) => (
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
              <label htmlFor="antecedente-meses-embarazo" style={{ fontSize: "0.8rem" }}>Meses:</label>
              <input
                id="antecedente-meses-embarazo"
                aria-label="Meses de embarazo"
                type="number"
                value={data.mesesEmbarazo}
                disabled={locked}
                onChange={(e) =>
                  handleChange(
                    "mesesEmbarazo",
                    e.target.value ? parseInt(e.target.value, 10) : 0
                  )
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
);

export const AntecedentesEstomatologicos = ({
  data,
  handleChange,
  locked,
}) => (
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
          <label htmlFor="antecedente-cepillado-freq">Cepillado (día)</label>
          <select
            id="antecedente-cepillado-freq"
            aria-label="Frecuencia de cepillado al día"
            value={data.cepilladoFreq}
            disabled={locked}
            onChange={(e) =>
              handleChange("cepilladoFreq", parseInt(e.target.value, 10))
            }
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3 o más</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="antecedente-seda-freq">Seda Dental</label>
          <select
            id="antecedente-seda-freq"
            aria-label="Frecuencia de uso de seda dental"
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
        <label htmlFor="antecedente-otros-habitos">Otros aditamentos higiene</label>
        <input
          id="antecedente-otros-habitos"
          aria-label="Otros aditamentos de higiene"
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
          <label htmlFor="antecedente-ultima-visita">Última visita odontol.</label>
          <input
            id="antecedente-ultima-visita"
            aria-label="Última visita odontológica"
            type="text"
            value={data.ultimaVisita}
            disabled={locked}
            onChange={(e) => handleChange("ultimaVisita", e.target.value)}
            placeholder="Fecha..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="antecedente-motivo-visita">Motivo</label>
          <input
            id="antecedente-motivo-visita"
            aria-label="Motivo de la visita"
            type="text"
            value={data.motivoVisita}
            disabled={locked}
            onChange={(e) => handleChange("motivoVisita", e.target.value)}
            placeholder="Ej. Dolor..."
          />
        </div>
      </div>
    </section>
);

export const ColumnaDerechaAntecedentes = (props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
    <AntecedentesToxicologicos {...props} />
    <AntecedentesMedicosPersonales {...props} />
    <AntecedentesEstomatologicos {...props} />
  </div>
);

export const AntecedentesFooter = ({
  locked,
  saving,
  saveError,
  saved,
  readOnly,
  bloqueo,
}) => (
  <>
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
          <Save size={18} /> {saving ? "Guardando..." : "Guardar Antecedentes"}
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
  </>
);
