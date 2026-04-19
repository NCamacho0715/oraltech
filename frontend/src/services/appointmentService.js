import axios from 'axios';

const API_URL = 'http://localhost:8080/api/appointments';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

// Fetch appointments in a date range (ISO strings: "2026-04-14")
export const getAppointmentsByRange = async (start, end) => {
    const response = await axios.get(API_URL, {
        params: { start, end },
        headers: getAuthHeader(),
    });
    return response.data;
};

// Fetch appointments for a specific patient
export const getAppointmentsByPatient = async (patientId) => {
    const response = await axios.get(`${API_URL}/patient/${patientId}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Create a new appointment
export const createAppointment = async (data) => {
    const response = await axios.post(API_URL, data, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Update an existing appointment
export const updateAppointment = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Delete an appointment
export const deleteAppointment = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};
