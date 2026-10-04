import React from "react";
import {
  Stethoscope,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Users,
  Calendar,
  Database,
} from "lucide-react";

export const DashboardNav = ({ user, isDark, toggleTheme, handleLogout }) => (
  <nav
    style={{
      background: "var(--surface)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "var(--shadow)",
      zIndex: 10,
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
      <h2 style={{ color: "var(--primary)", fontSize: "1.4rem", margin: 0 }}>
        OralTech
      </h2>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <button
        onClick={toggleTheme}
        aria-label="Alternar tema claro u oscuro"
        style={{
          background: "var(--secondary-soft)",
          color: "var(--primary)",
          padding: "0.5rem",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--text-secondary)",
        }}
      >
        <UserIcon size={18} />
        <span style={{ fontWeight: 500 }}>
          {user.username} ({user.role})
        </span>
      </div>
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--accent)",
          background: "none",
          fontWeight: 600,
        }}
      >
        <LogOut size={18} />
        Salir
      </button>
    </div>
  </nav>
);

export const DashboardStatsGrid = ({ stats }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.5rem",
      marginBottom: "3rem",
    }}
  >
    {[
      {
        label: "Pacientes Activos",
        value: stats.totalPatients,
        color: "var(--primary)",
      },
      {
        label: "Citas para Hoy",
        value: stats.appointmentsToday,
        color: "#00b4d8",
      },
      {
        label: "Historias Clínicas",
        value: stats.totalClinicalHistories,
        color: "#48cae4",
      },
    ].map((stat) => (
      <div
        key={stat.label}
        style={{
          background: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "16px",
          boxShadow: "var(--shadow)",
          borderLeft: `5px solid ${stat.color}`,
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {stat.label}
        </span>
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--text-main)",
            marginTop: "0.5rem",
          }}
        >
          {stat.value}
        </div>
      </div>
    ))}
  </div>
);

export const DashboardModulesGrid = ({ user, navigate }) => {
  const items = [
    {
      title: "Gestión de Pacientes",
      desc: "Registrar nuevos pacientes, ver fichas técnicas y acceder a sus historias clínicas.",
      icon: <Users size={32} />,
      color: "#0077b6",
      path: "/patients",
    },
    {
      title: "Agenda de Citas",
      desc: "Organizar la disponibilidad del consultorio y programar citas con pacientes.",
      icon: <Calendar size={32} />,
      color: "#0077b6",
      path: "/appointments",
    },
    ...(user.role === "ADMIN"
      ? [
          {
            title: "Respaldos",
            desc: "Gestionar y restaurar copias de seguridad de la base de datos.",
            icon: <Database size={32} />,
            color: "#7c3aed",
            path: "/backup",
          },
        ]
      : []),
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "2rem",
      }}
    >
      {items.map((item) => (
        <div
          key={item.path}
          className="auth-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate(item.path)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(item.path);
            }
          }}
          style={{
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            cursor: "pointer",
            transition:
              "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-10px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "22px",
              backgroundColor: item.color + "15",
              color: item.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              boxShadow: `0 10px 20px ${item.color}10`,
            }}
          >
            {item.icon}
          </div>
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-main)",
            }}
          >
            {item.title}
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              marginTop: "0.8rem",
              lineHeight: "1.5",
            }}
          >
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
};
