import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Stethoscope,
  LogOut,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import {
  HOURS,
  DAYS_ES,
  MONTHS_ES,
  STATUS_CONFIG,
  toISO,
  addDays,
  getWeekStart,
  timeToMinutes,
  formatTime,
} from "./appointmentConstants";

export const AppointmentsNavbar = ({
  navigate,
  isDark,
  toggleTheme,
  handleLogout,
}) => (
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
      <h2 style={{ color: "var(--primary)", fontSize: "1.3rem", margin: 0 }}>
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
        aria-label="Alternar tema visual"
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
);

export const AppointmentsCalendarHeader = ({
  weekStart,
  setWeekStart,
  setModal,
  appointmentsCount,
}) => (
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          aria-label="Semana anterior"
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
          aria-label="Semana siguiente"
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
        {appointmentsCount} cita{appointmentsCount !== 1 ? "s" : ""} esta semana
      </div>
    </div>
  </div>
);

export const AppointmentBlock = ({ appt, setModal, cellH }) => {
  const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDIENTE;
  const startMins = timeToMinutes(appt.startTime);
  const endMins = timeToMinutes(appt.endTime);
  const duration = endMins - startMins;
  const heightPx = Math.max((duration / 60) * cellH - 6, 28);

  const handleClick = (e) => {
    e.stopPropagation();
    setModal({ mode: "edit", data: appt });
  };

  return (
    <div
      className="appt-block"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e);
        }
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
};

export const AppointmentsCalendarGrid = ({
  weekDays,
  todayStr,
  loading,
  cellH,
  getAppointmentsInSlot,
  handleCellClick,
  setModal,
}) => (
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
              key={toISO(day)}
              style={{
                padding: "0.75rem 0.5rem",
                textAlign: "center",
                borderRight: i < 6 ? "1px solid var(--border-color)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: isToday ? "var(--primary)" : "var(--text-secondary)",
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

              {weekDays.map((day, di) => {
                const slotAppts = getAppointmentsInSlot(day, hour);
                const isToday = toISO(day) === todayStr;
                const isEmpty = slotAppts.length === 0;
                return (
                  <div
                    key={toISO(day)}
                    className={isEmpty ? "appt-cell" : ""}
                    role={isEmpty ? "button" : undefined}
                    tabIndex={isEmpty ? 0 : undefined}
                    aria-label={
                      isEmpty
                        ? `Crear cita ${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"} ${DAYS_ES[day.getDay()]}`
                        : undefined
                    }
                    onClick={() => isEmpty && handleCellClick(day, hour)}
                    onKeyDown={(e) => {
                      if (isEmpty && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleCellClick(day, hour);
                      }
                    }}
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
                    {slotAppts.map((appt) => (
                      <AppointmentBlock
                        key={appt.id}
                        appt={appt}
                        setModal={setModal}
                        cellH={cellH}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export const AppointmentToast = ({ toast }) => {
  if (!toast) return null;
  return (
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
  );
};
