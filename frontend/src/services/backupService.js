import axios from 'axios';
 
const API = '/api/backup';
const h = () => { const u = JSON.parse(localStorage.getItem('user')); return u?.token ? { Authorization: `Bearer ${u.token}` } : {}; };
 
export const getLatest = () => axios.get(`${API}/latest`, { headers: h() }).then(r => r.data);
export const listBackups = () => axios.get(`${API}/list`, { headers: h() }).then(r => r.data);
export const runBackup = () => axios.post(`${API}/run`, {}, { headers: h() }).then(r => r.data);
export const validateBackup = (f) => axios.get(`${API}/validate/${f}`, { headers: h() }).then(r => r.data);
export const restoreBackup = (f) => axios.post(`${API}/restore/${f}`, {}, { headers: h() }).then(r => r.data);
 