import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const API_URL = API_BASE_URL;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(`${API_URL}/users`, userData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await axios.put(
    `${API_URL}/users/${id}/role`,
    { role },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/users/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
