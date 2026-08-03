import api from './client';

export const getSalon = () => api.get('/salon').then((r) => r.data);
export const getCoupes = () => api.get('/coupes', { params: { actif: true } }).then((r) => r.data);
export const getCoupe = (id) => api.get(`/coupes/${id}`).then((r) => r.data);
export const getCreneauxDisponibles = (date) =>
  api.get('/creneaux-disponibles', { params: { date } }).then((r) => r.data);
export const creerRendezVous = (payload) => api.post('/rendez-vous', payload).then((r) => r.data);
