import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export function getErrorMessage(error, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors).flat().find(Boolean);
    if (firstError) return firstError;
  }

  if (data?.message) return data.message;
  if (error?.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre.';
  if (!error?.response) return 'Impossible de joindre le serveur. Vérifiez que l’API Laravel est démarrée.';

  return fallback;
}

export default api;
