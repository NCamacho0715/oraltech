import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API = `${API_BASE_URL}/backup`;
const h = () => { const u = JSON.parse(localStorage.getItem('user')); return u?.token ? { Authorization: `Bearer ${u.token}` } : {}; };
 
export const getLatest = () => axios.get(`${API}/latest`, { headers: h() }).then(r => r.data);
export const listBackups = () => axios.get(`${API}/list`, { headers: h() }).then(r => r.data);
export const runBackup = () => axios.post(`${API}/run`, {}, { headers: h() }).then(r => r.data);
export const validateBackup = (f) => axios.get(`${API}/validate/${f}`, { headers: h() }).then(r => r.data);
export const restoreBackup = (f) => axios.post(`${API}/restore/${f}`, {}, { headers: h() }).then(r => r.data);
 