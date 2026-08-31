import axios from 'axios';

const headers = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return { Authorization: `Bearer ${user?.token}` };
};

export const getBackups = async () => (await axios.get('/api/backups', { headers: headers() })).data;
export const runBackup = async () => (await axios.post('/api/backups/run', {}, { headers: headers() })).data;
export const restoreBackup = async (filename, confirmation) =>
  (await axios.post(`/api/backups/${encodeURIComponent(filename)}/restore`, { confirmation }, { headers: headers() })).data;

export const getBackupWarnings = async () => (await axios.get('/api/backups/warnings', { headers: headers() })).data;
