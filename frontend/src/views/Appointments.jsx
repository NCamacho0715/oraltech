import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";
import { getAllPatients } from "../services/patientService";
import {
  getAppointmentsByRange,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../services/appointmentService";
import {
  toISO,
  getWeekStart,
  addDays,
} from "../components/appointments/appointmentConstants";
import AppointmentModal from "../components/appointments/AppointmentModal";
import {
  AppointmentsNavbar,
  AppointmentsCalendarHeader,
  AppointmentsCalendarGrid,
  AppointmentToast,
} from "../components/appointments/AppointmentsCalendar";

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

  const refreshAppointments = async () => {
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
  };

  useEffect(() => {
    let ignore = false;
    const fetchAppointments = async () => {
      try {
        const start = toISO(weekStart);
        const end = toISO(addDays(weekStart, 6));
        const data = await getAppointmentsByRange(start, end);
        if (!ignore) {
          setAppointments(data);
        }
      } catch (e) {
        if (!ignore) console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchAppointments();
    return () => {
      ignore = true;
    };
  }, [weekStart]);

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
    refreshAppointments();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta cita?")) return;
    await deleteAppointment(id);
    setModal(null);
    refreshAppointments();
    showToast("Cita eliminada.", "error");
  };

  // Build week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayStr = toISO(new Date());

  // Get appointments for a specific day/hour cell
  const getAppointmentsInSlot = (day, hour) => {
    const dayStr = toISO(day);
    return appointments.filter((a) => {
      const startH = parseInt(a.startTime.split(":")[0], 10);
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

      <AppointmentsNavbar
        navigate={navigate}
        isDark={isDark}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />

      <AppointmentsCalendarHeader
        weekStart={weekStart}
        setWeekStart={setWeekStart}
        setModal={setModal}
        appointmentsCount={appointments.length}
      />

      <AppointmentsCalendarGrid
        weekDays={weekDays}
        todayStr={todayStr}
        loading={loading}
        cellH={cellH}
        getAppointmentsInSlot={getAppointmentsInSlot}
        handleCellClick={handleCellClick}
        setModal={setModal}
      />

      {modal && (
        <AppointmentModal
          initial={modal.data}
          patients={patients}
          onSave={handleSave}
          onDelete={modal.mode === "edit" ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}

      <AppointmentToast toast={toast} />
    </div>
  );
};

export default Appointments;
