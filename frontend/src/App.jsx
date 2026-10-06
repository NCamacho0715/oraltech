import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import AppLayout from './components/layout/AppLayout';
import './index.css';

// Code splitting por ruta: cada vista se descarga solo al navegar a ella,
// en vez de cargar toda la app en el login.
const Register = lazy(() => import('./views/Register'));
const Dashboard = lazy(() => import('./views/Dashboard'));
const PatientList = lazy(() => import('./views/PatientList'));
const PatientForm = lazy(() => import('./views/PatientForm'));
const PatientDetail = lazy(() => import('./views/PatientDetail'));
const ClinicalHistory = lazy(() => import('./views/ClinicalHistory'));
const Appointments = lazy(() => import('./views/Appointments'));
const BackupManager = lazy(() => import('./views/BackupManager'));
const UserManagement = lazy(() => import('./views/UserManagement'));

const RouteFallback = () => (
  <div className="flex justify-center items-center h-screen" style={{ color: 'var(--text-secondary)' }}>
    Cargando...
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/backup" element={<BackupManager />} />
            <Route path="/configuracion" element={<UserManagement />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/patients/:id/clinica" element={<ClinicalHistory />} />
            <Route path="/patients/edit/:id" element={<PatientForm />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
