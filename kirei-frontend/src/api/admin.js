import api from './client';

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);

// Coupes
export const adminGetCoupes = () => api.get('/admin/coupes').then((r) => r.data);
export const adminCreateCoupe = (formData) =>
  api.post('/admin/coupes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const adminUpdateCoupe = (id, formData) =>
  api.put(`/admin/coupes/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const adminDeleteCoupe = (id) => api.delete(`/admin/coupes/${id}`).then((r) => r.data);

// Rendez-vous
export const adminGetRendezVous = (params) => api.get('/admin/rendez-vous', { params }).then((r) => r.data);
export const adminValiderRdv = (id) => api.patch(`/admin/rendez-vous/${id}/valider`).then((r) => r.data);
export const adminRefuserRdv = (id) => api.patch(`/admin/rendez-vous/${id}/refuser`).then((r) => r.data);
export const adminTerminerRdv = (id) => api.patch(`/admin/rendez-vous/${id}/terminer`).then((r) => r.data);
export const adminAnnulerRdv = (id) => api.patch(`/admin/rendez-vous/${id}/annuler`).then((r) => r.data);

// Salon / horaires / congés
export const adminGetSalon = () => api.get('/admin/salon').then((r) => r.data);
export const adminUpdateSalon = (payload) => api.put('/admin/salon', payload).then((r) => r.data);
export const adminUpdateHoraires = (horaires) => api.put('/admin/salon/horaires', horaires).then((r) => r.data);
export const adminGetIndisponibilites = () => api.get('/admin/indisponibilites').then((r) => r.data);
export const adminCreerIndisponibilite = (payload) =>
  api.post('/admin/indisponibilites', payload).then((r) => r.data);
export const adminSupprimerIndisponibilite = (id) =>
  api.delete(`/admin/indisponibilites/${id}`).then((r) => r.data);

// Dashboard
export const adminGetDashboard = () => api.get('/admin/dashboard').then((r) => r.data);
export const adminGetCoupesPopulaires = () => api.get('/admin/dashboard/coupes-populaires').then((r) => r.data);

// Clients
export const adminGetClients = () => api.get('/admin/clients').then((r) => r.data);
export const adminGetClient = (id) => api.get(`/admin/clients/${id}`).then((r) => r.data);
