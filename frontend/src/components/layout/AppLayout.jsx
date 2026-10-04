import React, { useState } from "react";
import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/authService";
import { DashboardNav } from "../dashboard/DashboardComponents";

export default function AppLayout() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setIsDark(!isDark);
    localStorage.setItem("theme", nextTheme);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DashboardNav
        user={user}
        isDark={isDark}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </div>
    </div>
  );
}
