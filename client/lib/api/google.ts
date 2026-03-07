import api from '../axios';

export const getGoogleStatus = async (): Promise<boolean> => {
  const res = await api.get('/google/status');
  return res.data.connected;
};

export const getGoogleAuthUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return `${baseUrl}/google/connect`;
};

export const disconnectGoogle = async (): Promise<void> => {
  await api.post('/google/disconnect');
};
