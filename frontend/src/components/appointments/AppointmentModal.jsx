import React, { useState } from "react";
import {
  Calendar,
  X,
  Check,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  STATUS_CONFIG,
  toISO,
  timeToMinutes,
  minutesToTime,
} from "./appointmentConstants";

export const Modal = ({ children, onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      animation: "fadeIn 0.15s ease",
    }}
  >
    <button
      type="button"
      aria-label="Cerrar modal"
      tabIndex={-1}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        border: "none",
        cursor: "default",
        zIndex: -1,
      }}
    />
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "20px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        width: "100%",
        maxWidth: "520px",
        maxHeight: "90vh",
        overflowY: "auto",
        border: "1px solid var(--border-color)",
        animation: "slideUp 0.2s ease",
        position: "relative",
        zIndex: 1,
      }}
    >
      {children}
    </div>
  </div>
);

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  background: "var(--background)",
  border: "1.5px solid var(--border-color)",
  borderRadius: "10px",
  color: "var(--text-main)",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.35rem",
  display: "block",
};

const validateAppointment = (form) => {
  if (!form.patientId) return "Selecciona un paciente.";
  if (!form.title.trim()) return "Escribe un título para la cita.";
  if (!form.appointmentDate) return "Selecciona una fecha.";
  if (timeToMinutes(form.endTime) <= timeToMinutes(form.startTime)) {
    return "La hora de fin debe ser mayor a la hora de inicio.";
  }
  return null;
};

export const AppointmentFormFields = ({ form, set, patients }) => (
  <>
    <div>
      <label htmlFor="appointment-patient" style={labelStyle}>
        Paciente
      </label>
      <select
        id="appointment-patient"
        value={form.patientId}
        onChange={(e) => set("patientId", e.target.value)}
        style={inputStyle}
      >
        <option value="">— Seleccionar paciente —</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.names} {p.firstSurname} {p.secondSurname || ""}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label htmlFor="appointment-title" style={labelStyle}>
        Motivo / Título
      </label>
      <input
        id="appointment-title"
        type="text"
        placeholder="Ej: Limpieza dental, Extracción…"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        style={inputStyle}
      />
    </div>

    <div>
      <label htmlFor="appointment-date" style={labelStyle}>
        Fecha
      </label>
      <input
        id="appointment-date"
        type="date"
        value={form.appointmentDate}
        onChange={(e) => set("appointmentDate", e.target.value)}
        style={inputStyle}
      />
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
      }}
    >
      <div>
        <label htmlFor="appointment-start-time" style={labelStyle}>
          Hora inicio
        </label>
        <input
          id="appointment-start-time"
          type="time"
          value={form.startTime}
          onChange={(e) => {
            set("startTime", e.target.value);
            const endMins = timeToMinutes(e.target.value) + 30;
            if (endMins <= 19 * 60) set("endTime", minutesToTime(endMins));
          }}
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="appointment-end-time" style={labelStyle}>
          Hora fin
        </label>
        <input
          id="appointment-end-time"
          type="time"
          value={form.endTime}
          onChange={(e) => set("endTime", e.target.value)}
          style={inputStyle}
        />
      </div>
    </div>

    <div>
      <label htmlFor="appointment-status" style={labelStyle}>
        Estado
      </label>
      <select
        id="appointment-status"
        value={form.status}
        onChange={(e) => set("status", e.target.value)}
        style={inputStyle}
      >
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label htmlFor="appointment-notes" style={labelStyle}>
        Notas (opcional)
      </label>
      <textarea
        id="appointment-notes"
        rows={3}
        placeholder="Observaciones, indicaciones…"
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
        style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
      />
    </div>
  </>
);

export const AppointmentModalHeader = ({ isEdit, onClose }) => (
  <div
    style={{
      padding: "1.5rem 1.75rem 1rem",
      borderBottom: "1px solid var(--border-color)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Calendar size={18} />
      </div>
      <div>
        <h3
          id="appointment-modal-title"
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--text-main)",
          }}
        >
          {isEdit ? "Editar Cita" : "Nueva Cita"}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
          }}
        >
          {isEdit
            ? "Modifica los datos de la cita"
            : "Completa la información de la cita"}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      aria-label="Cerrar modal de cita"
      style={{
        background: "var(--secondary-soft)",
        border: "none",
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        cursor: "pointer",
      }}
    >
      <X size={16} />
    </button>
  </div>
);

export const AppointmentModalFooter = ({
  isEdit,
  onDelete,
  initialId,
  onClose,
  onSubmit,
  saving,
}) => (
  <div
    style={{
      padding: "1rem 1.75rem 1.5rem",
      display: "flex",
      gap: "0.75rem",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid var(--border-color)",
    }}
  >
    {isEdit && onDelete ? (
      <button
        onClick={() => onDelete(initialId)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(230,57,70,0.1)",
          color: "#e63946",
          border: "1px solid rgba(230,57,70,0.25)",
          padding: "0.6rem 1rem",
          borderRadius: "10px",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <Trash2 size={15} /> Eliminar
      </button>
    ) : (
      <div />
    )}
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <button
        onClick={onClose}
        style={{
          padding: "0.6rem 1.2rem",
          background: "var(--secondary-soft)",
          color: "var(--text-secondary)",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "0.85rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        Cancelar
      </button>
      <button
        onClick={onSubmit}
        disabled={saving}
        style={{
          padding: "0.6rem 1.4rem",
          background: saving ? "var(--text-secondary)" : "var(--primary)",
          color: "white",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "0.85rem",
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <Check size={15} />{" "}
        {saving ? "Guardando…" : isEdit ? "Actualizar" : "Agendar"}
      </button>
    </div>
  </div>
);

export const AppointmentModal = ({
  initial,
  patients,
  onSave,
  onClose,
  onDelete,
}) => {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    patientId: initial?.patientId || "",
    title: initial?.title || "",
    appointmentDate: initial?.appointmentDate || toISO(new Date()),
    startTime: initial?.startTime || "08:00",
    endTime: initial?.endTime || "08:30",
    notes: initial?.notes || "",
    status: initial?.status || "PENDIENTE",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const err = validateAppointment(form);
    if (err) return setError(err);
    setError("");
    setSaving(true);
    try {
      await onSave({ ...form, patientId: Number(form.patientId) });
    } catch (e) {
      setError(e?.response?.data || "Error al guardar la cita.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <AppointmentModalHeader isEdit={isEdit} onClose={onClose} />

      <div
        style={{
          padding: "1.5rem 1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.1rem",
        }}
      >
        {error && (
          <div
            style={{
              background: "rgba(230,57,70,0.1)",
              border: "1px solid rgba(230,57,70,0.3)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#e63946",
              fontSize: "0.85rem",
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <AppointmentFormFields form={form} set={set} patients={patients} />
      </div>

      <AppointmentModalFooter
        isEdit={isEdit}
        onDelete={onDelete}
        initialId={initial?.id}
        onClose={onClose}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </Modal>
  );
};

export default AppointmentModal;
