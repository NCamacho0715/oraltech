import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

const clinicaService = {
  // Historia Clinica
  createHistoria: (patientId) =>
    axios.post(
      `${API_URL}/historias`,
      { pacienteId: patientId, odontologoId: 1 },
      { headers: getAuthHeader() },
    ),

  getHistoriaByPacienteId: (patientId) =>
    axios.get(`${API_URL}/historias/paciente/${patientId}`, {
      headers: getAuthHeader(),
    }),

  getPatientById: (patientId) =>
    axios.get(`${API_URL}/patients/${patientId}`, {
      headers: getAuthHeader(),
    }),

  // Anamnesis
  getAnamnesis: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/anamnesis`, {
      headers: getAuthHeader(),
    }),

  upsertAnamnesis: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/anamnesis`, data, {
      headers: getAuthHeader(),
    }),

  // Antecedentes
  getAntecedentes: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/antecedentes`, {
      headers: getAuthHeader(),
    }),

  upsertAntecedentes: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/antecedentes`, data, {
      headers: getAuthHeader(),
    }),

  // Examen Clinico
  getExamen: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/examen`, {
      headers: getAuthHeader(),
    }),

  upsertExamen: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/examen`, data, {
      headers: getAuthHeader(),
    }),

  // Diagnostico
  getDiagnostico: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/diagnostico`, {
      headers: getAuthHeader(),
    }),

  upsertDiagnostico: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/diagnostico`, data, {
      headers: getAuthHeader(),
    }),

  // Pronostico
  getPronostico: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/pronostico`, {
      headers: getAuthHeader(),
    }),

  upsertPronostico: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/pronostico`, data, {
      headers: getAuthHeader(),
    }),

  // Interconsultas
  listInterconsultas: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/interconsultas`, {
      headers: getAuthHeader(),
    }),

  createInterconsulta: (historiaId, data) =>
    axios.post(`${API_URL}/historias/${historiaId}/interconsultas`, data, {
      headers: getAuthHeader(),
    }),

  // Plan de Tratamiento
  listPlanes: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/plan`, {
      headers: getAuthHeader(),
    }),

  createPlan: (historiaId, data) =>
    axios.post(`${API_URL}/historias/${historiaId}/plan`, data, {
      headers: getAuthHeader(),
    }),

  // Consentimiento
  getConsentimiento: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/consentimiento`, {
      headers: getAuthHeader(),
    }),

  upsertConsentimiento: (historiaId, data) =>
    axios.post(`${API_URL}/historias/${historiaId}/consentimiento`, data, {
      headers: getAuthHeader(),
    }),

  // Evoluciones
  listEvoluciones: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/evoluciones`, {
      headers: getAuthHeader(),
    }),

  getEvolucionDetail: (historiaId, evolucionId) =>
    axios.get(`${API_URL}/historias/${historiaId}/evoluciones/${evolucionId}`, {
      headers: getAuthHeader(),
    }),

  createEvolucion: (historiaId, data) =>
    axios.post(`${API_URL}/historias/${historiaId}/evoluciones`, data, {
      headers: getAuthHeader(),
    }),

  // Odontograma
  listOdontograma: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/odontograma`, {
      headers: getAuthHeader(),
    }),

  createOdontogramaRegistro: (historiaId, data) =>
    axios.post(`${API_URL}/historias/${historiaId}/odontograma`, data, {
      headers: getAuthHeader(),
    }),

  deleteOdontogramaRegistro: (historiaId, registroId) =>
    axios.delete(
      `${API_URL}/historias/${historiaId}/odontograma/${registroId}`,
      { headers: getAuthHeader() },
    ),

  // Protesis
  getProtesis: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/odontograma/protesis`, {
      headers: getAuthHeader(),
    }),

  upsertProtesis: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/odontograma/protesis`, data, {
      headers: getAuthHeader(),
    }),

  // Análisis Pulpar
  getAnalisisPulpar: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/analisis-pulpar`, {
      headers: getAuthHeader(),
    }),

  upsertAnalisisPulpar: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/analisis-pulpar`, data, {
      headers: getAuthHeader(),
    }),

  // Análisis Periodontal
  getAnalisisPeriodontal: (historiaId) =>
    axios.get(`${API_URL}/historias/${historiaId}/analisis-periodontal`, {
      headers: getAuthHeader(),
    }),

  upsertAnalisisPeriodontal: (historiaId, data) =>
    axios.put(`${API_URL}/historias/${historiaId}/analisis-periodontal`, data, {
      headers: getAuthHeader(),
    }),
};

export default clinicaService;
