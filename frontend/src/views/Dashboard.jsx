import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getDashboardStats } from "../services/dashboardService";
import {
  DashboardStatsGrid,
  DashboardModulesGrid,
} from "../components/dashboard/DashboardComponents";

const Dashboard = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [stats, setStats] = React.useState({
    totalPatients: 0,
    totalClinicalHistories: 0,
    appointmentsToday: 0,
    availableBackups: 0,
  });

  React.useEffect(() => {
    const user = getCurrentUser();

    if (!user?.token) {
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats(user.token);
        setStats(data);
      } catch (e) {
        console.error("Error fetching stats", e);
      }
    };

    fetchStats();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main
      style={{
        flex: 1,
        padding: "3rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <header style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "var(--text-main)",
          }}
        >
          Bienvenido, {user.username}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Panel de gestión del Consultorio Odontológico JG.
        </p>
      </header>

      <DashboardStatsGrid stats={stats} role={user.role} />
      <DashboardModulesGrid user={user} navigate={navigate} />
    </main>
  );
};

export default Dashboard;
