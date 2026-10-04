import axios from 'axios';

const API_URL = 'http://localhost:8080/api/patients';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

export const getAllPatients = async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data;
};

export const getPatientsPaginated = async (page = 0, size = 10, search = '') => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (search && search.trim()) {
        params.append('search', search.trim());
    }
    const response = await axios.get(`${API_URL}?${params.toString()}`, { headers: getAuthHeader() });
    return response.data;
};

export const getPatientById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const createPatient = async (patientData) => {
    const response = await axios.post(API_URL, patientData, { headers: getAuthHeader() });
    return response.data;
};

export const updatePatient = async (id, patientData) => {
    const response = await axios.put(`${API_URL}/${id}`, patientData, { headers: getAuthHeader() });
    return response.data;
};

export const deletePatient = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
};
