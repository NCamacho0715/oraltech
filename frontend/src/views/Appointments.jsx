import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Clock,
  User,
  FileText,
  Stethoscope,
  LogOut,
  Moon,
  Sun,
  Check,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { getCurrentUser, logout } from "../services/authService";
import { getAllPatients } from "../services/patientService";
import {
  getAppointmentsByRange,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../services/appointmentService";

// ─── Constants ───────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 – 19:00
const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const STATUS_CONFIG = {
  PENDIENTE: {
    label: "Pendiente",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    dot: "#f59e0b",
  },
  CONFIRMADA: {
    label: "Confirmada",
    color: "#0077b6",
    bg: "rgba(0,119,182,0.15)",
    dot: "#0077b6",
  },
  COMPLETADA: {
    label: "Completada",
    color: "#2a9d8f",
    bg: "rgba(42,157,143,0.15)",
    dot: "#2a9d8f",
  },
  CANCELADA: {
    label: "Cancelada",
    color: "#e63946",
    bg: "rgba(230,57,70,0.15)",
    dot: "#e63946",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toISO = (d) => d.toISOString().split("T")[0];

const getWeekStart = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

// ─── Modal Component ──────────────────────────────────────────────────────────
const Modal = ({ children, onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      backdropFilter: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      animation: "fadeIn 0.15s ease",
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
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
      }}
    >
      {children}
    </div>
  </div>
);

// ─── Appointment Form Modal ───────────────────────────────────────────────────
const AppointmentModal = ({ initial, patients, onSave, onClose, onDelete }) => {
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
    if (!form.patientId) return setError("Selecciona un paciente.");
    if (!form.title.trim()) return setError("Escribe un título para la cita.");
    if (!form.appointmentDate) return setError("Selecciona una fecha.");
    if (timeToMinutes(form.endTime) <= timeToMinutes(form.startTime))
      return setError("La hora de fin debe ser mayor a la hora de inicio.");
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

  return (
    <Modal onClose={onClose}>
      {/* Header */}
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

      {/* Body */}
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

        {/* Patient */}
        <div>
          <label style={labelStyle}>Paciente</label>
          <select
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

        {/* Title */}
        <div>
          <label style={labelStyle}>Motivo / Título</label>
          <input
            type="text"
            placeholder="Ej: Limpieza dental, Extracción…"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Date */}
        <div>
          <label style={labelStyle}>Fecha</label>
          <input
            type="date"
            value={form.appointmentDate}
            onChange={(e) => set("appointmentDate", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Time row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <label style={labelStyle}>Hora inicio</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => {
                set("startTime", e.target.value);
                // auto-advance end time by 30 min
                const endMins = timeToMinutes(e.target.value) + 30;
                if (endMins <= 19 * 60) set("endTime", minutesToTime(endMins));
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hora fin</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Estado</label>
          <select
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

        {/* Notes */}
        <div>
          <label style={labelStyle}>Notas (opcional)</label>
          <textarea
            rows={3}
            placeholder="Observaciones, indicaciones…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
          />
        </div>
      </div>

      {/* Footer */}
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
            onClick={() => onDelete(initial.id)}
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
            onClick={handleSubmit}
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
    </Modal>
  );
};

// ─── Main Appointments View ───────────────────────────────────────────────────
const Appointments = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'new'|'edit', data }
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark",
  );
  const [toast, setToast] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load patients once
  useEffect(() => {
    getAllPatients().then(setPatients).catch(console.error);
  }, []);

  // Load appointments whenever week changes
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const start = toISO(weekStart);
      const end = toISO(addDays(weekStart, 6));
      const data = await getAppointmentsByRange(start, end);
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Toast helper
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setIsDark(!isDark);
    localStorage.setItem("theme", next);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Appointment CRUD
  const handleSave = async (formData) => {
    if (modal?.data?.id) {
      await updateAppointment(modal.data.id, formData);
      showToast("Cita actualizada correctamente.");
    } else {
      await createAppointment(formData);
      showToast("Cita agendada correctamente.");
    }
    setModal(null);
    loadAppointments();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta cita?")) return;
    await deleteAppointment(id);
    setModal(null);
    loadAppointments();
    showToast("Cita eliminada.", "error");
  };

  // Build week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayStr = toISO(new Date());

  // Get appointments for a specific day/hour cell
  const getAppointmentsInSlot = (day, hour) => {
    const dayStr = toISO(day);
    return appointments.filter((a) => {
      const startH = parseInt(a.startTime.split(":")[0]);
      return a.appointmentDate === dayStr && startH === hour;
    });
  };

  // Click on empty cell → open new appointment modal
  const handleCellClick = (day, hour) => {
    setModal({
      mode: "new",
      data: {
        appointmentDate: toISO(day),
        startTime: `${hour.toString().padStart(2, "0")}:00`,
        endTime: `${hour.toString().padStart(2, "0")}:30`,
      },
    });
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const cellH = 64; // px per hour row

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* ── CSS Keyframes ── */}
      <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
                @keyframes toastIn { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
                .appt-cell:hover { background: var(--secondary-soft) !important; cursor: pointer; }
                .appt-block:hover { filter: brightness(1.08); cursor: pointer; transform: scale(1.01); }
                .appt-block { transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease; }
                select, input, textarea { color-scheme: inherit; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
            `}</style>

      {/* ── Navbar ── */}
      <nav
        style={{
          background: "var(--surface)",
          padding: "0.9rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "var(--shadow)",
          zIndex: 10,
          position: "sticky",
          top: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "var(--primary)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <Stethoscope size={18} />
          </div>
          <h2
            style={{ color: "var(--primary)", fontSize: "1.3rem", margin: 0 }}
          >
            OralTech
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "var(--secondary-soft)",
              color: "var(--primary)",
              padding: "0.45rem 1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={toggleTheme}
            style={{
              background: "var(--secondary-soft)",
              color: "var(--primary)",
              padding: "0.5rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--accent)",
              background: "none",
              border: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      {/* ── Page Header ── */}
      <div
        style={{
          padding: "1.5rem 2rem 0",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "var(--text-main)",
                margin: 0,
              }}
            >
              Agenda de Citas
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                margin: "0.2rem 0 0",
              }}
            >
              Vista semanal · {MONTHS_ES[weekStart.getMonth()]}{" "}
              {weekStart.getFullYear()}
            </p>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {/* Week navigation */}
            <button
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border-color)",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-main)",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setWeekStart(getWeekStart(new Date()))}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border-color)",
                padding: "0.4rem 0.9rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--text-main)",
              }}
            >
              Hoy
            </button>
            <button
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border-color)",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-main)",
              }}
            >
              <ChevronRight size={18} />
            </button>
            {/* New appointment button */}
            <button
              onClick={() => setModal({ mode: "new", data: {} })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--primary)",
                color: "white",
                border: "none",
                padding: "0.55rem 1.1rem",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,119,182,0.3)",
              }}
            >
              <Plus size={17} /> Nueva Cita
            </button>
          </div>
        </div>

        {/* ── Legend ── */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          {Object.values(STATUS_CONFIG).map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: s.dot,
                  display: "inline-block",
                }}
              />
              {s.label}
            </div>
          ))}
          <div
            style={{
              marginLeft: "auto",
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
            }}
          >
            {appointments.length} cita{appointments.length !== 1 ? "s" : ""}{" "}
            esta semana
          </div>
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div
        style={{
          flex: 1,
          padding: "0 2rem 2rem",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "16px",
            boxShadow: "var(--shadow)",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
          }}
        >
          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "64px repeat(7, 1fr)",
              borderBottom: "2px solid var(--border-color)",
              background: "var(--background)",
            }}
          >
            <div
              style={{
                padding: "0.75rem",
                borderRight: "1px solid var(--border-color)",
              }}
            />
            {weekDays.map((day, i) => {
              const isToday = toISO(day) === todayStr;
              return (
                <div
                  key={i}
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    borderRight:
                      i < 6 ? "1px solid var(--border-color)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: isToday
                        ? "var(--primary)"
                        : "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {DAYS_ES[day.getDay()]}
                  </div>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isToday ? "var(--primary)" : "transparent",
                      color: isToday ? "white" : "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0.2rem auto 0",
                      fontWeight: isToday ? 700 : 500,
                      fontSize: "1rem",
                    }}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hour rows — scrollable */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 320px)",
              minHeight: "400px",
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    ⏳
                  </div>
                  Cargando citas…
                </div>
              </div>
            ) : (
              HOURS.map((hour) => (
                <div
                  key={hour}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px repeat(7, 1fr)",
                    borderBottom: "1px solid var(--border-color)",
                    minHeight: `${cellH}px`,
                  }}
                >
                  {/* Hour label */}
                  <div
                    style={{
                      padding: "0.4rem 0.6rem",
                      textAlign: "right",
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      borderRight: "1px solid var(--border-color)",
                      paddingTop: "0.35rem",
                      lineHeight: 1,
                    }}
                  >
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
                  </div>

                  {/* Day cells */}
                  {weekDays.map((day, di) => {
                    const slotAppts = getAppointmentsInSlot(day, hour);
                    const isToday = toISO(day) === todayStr;
                    return (
                      <div
                        key={di}
                        className={slotAppts.length === 0 ? "appt-cell" : ""}
                        onClick={() =>
                          slotAppts.length === 0 && handleCellClick(day, hour)
                        }
                        style={{
                          borderRight:
                            di < 6 ? "1px solid var(--border-color)" : "none",
                          padding: "3px 4px",
                          background: isToday
                            ? "rgba(0,119,182,0.03)"
                            : "transparent",
                          position: "relative",
                          minHeight: `${cellH}px`,
                          transition: "background 0.15s",
                        }}
                      >
                        {slotAppts.map((appt) => {
                          const cfg =
                            STATUS_CONFIG[appt.status] ||
                            STATUS_CONFIG.PENDIENTE;
                          const startMins = timeToMinutes(appt.startTime);
                          const endMins = timeToMinutes(appt.endTime);
                          const duration = endMins - startMins;
                          const heightPx = Math.max(
                            (duration / 60) * cellH - 6,
                            28,
                          );
                          return (
                            <div
                              key={appt.id}
                              className="appt-block"
                              onClick={(e) => {
                                e.stopPropagation();
                                setModal({ mode: "edit", data: appt });
                              }}
                              title={`${appt.patientName} — ${appt.title}\n${formatTime(appt.startTime)} - ${formatTime(appt.endTime)}`}
                              style={{
                                background: cfg.bg,
                                border: `1.5px solid ${cfg.color}`,
                                borderLeft: `4px solid ${cfg.color}`,
                                borderRadius: "8px",
                                padding: "3px 6px",
                                marginBottom: "2px",
                                height: `${heightPx}px`,
                                overflow: "hidden",
                                userSelect: "none",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: cfg.color,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {formatTime(appt.startTime)}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.73rem",
                                  fontWeight: 600,
                                  color: "var(--text-main)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {appt.patientName}
                              </div>
                              {heightPx > 44 && (
                                <div
                                  style={{
                                    fontSize: "0.68rem",
                                    color: "var(--text-secondary)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {appt.title}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <AppointmentModal
          initial={modal.data}
          patients={patients}
          onSave={handleSave}
          onDelete={modal.mode === "edit" ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 2000,
            background: toast.type === "error" ? "#e63946" : "#2a9d8f",
            color: "white",
            padding: "0.75rem 1.25rem",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "0.88rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "toastIn 0.2s ease",
          }}
        >
          <Check size={16} /> {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Appointments;
