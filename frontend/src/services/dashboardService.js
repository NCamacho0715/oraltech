import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const API_URL = `${API_BASE_URL}/dashboard`;

export const getDashboardStats = async (token) => {
    const response = await axios.get(`${API_URL}/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};