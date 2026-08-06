import api from "./client";

export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const getMe = () =>
  api.get("/api/auth/me").then((r) => r.data);

// Coupes
export const adminGetCoupes = () =>
  api.get("/api/admin/coupes").then((r) => r.data);

export const adminCreateCoupe = (payload) =>
  api.post("/api/admin/coupes", payload).then((r) => r.data);

export const adminUpdateCoupe = (id, payload) =>
  api.put(`/api/admin/coupes/${id}`, payload).then((r) => r.data);

export const adminDeleteCoupe = (id) =>
  api.delete(`/api/admin/coupes/${id}`).then((r) => r.data);

export const adminAddCoupePhoto = (coupeId, file) => {
  const formData = new FormData();
  formData.append("image", file);

  return api
    .post(`/api/admin/coupes/${coupeId}/photos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((r) => r.data);
};

export const adminDeleteCoupePhoto = (coupeId, photoId) =>
  api
    .delete(`/api/admin/coupes/${coupeId}/photos/${photoId}`)
    .then((r) => r.data);


// Rendez-vous
export const adminGetRendezVous = (params) =>
  api.get("/api/admin/rendez-vous", { params }).then((r) => r.data);

export const adminValiderRdv = (id) =>
  api
    .patch(`/api/admin/rendez-vous/${id}/valider`)
    .then((r) => r.data);

export const adminRefuserRdv = (id) =>
  api
    .patch(`/api/admin/rendez-vous/${id}/refuser`)
    .then((r) => r.data);

export const adminTerminerRdv = (id) =>
  api
    .patch(`/api/admin/rendez-vous/${id}/terminer`)
    .then((r) => r.data);

export const adminAnnulerRdv = (id) =>
  api
    .patch(`/api/admin/rendez-vous/${id}/annuler`)
    .then((r) => r.data);

export const adminAssignerAssistant = (id, assistantId) =>
  api
    .patch(`/api/admin/rendez-vous/${id}/assistant`, {
      assistantId: assistantId || null,
    })
    .then((r) => r.data);


// Assistants
export const adminGetAssistants = () =>
  api.get("/api/admin/assistants").then((r) => r.data);

export const adminCreateAssistant = (payload) =>
  api.post("/api/admin/assistants", payload).then((r) => r.data);

export const adminUpdateAssistant = (id, payload) =>
  api.put(`/api/admin/assistants/${id}`, payload).then((r) => r.data);

export const adminDeleteAssistant = (id) =>
  api.delete(`/api/admin/assistants/${id}`).then((r) => r.data);


// Salon
export const adminGetSalon = () =>
  api.get("/api/admin/salon").then((r) => r.data);

export const adminUpdateSalon = (payload) =>
  api.put("/api/admin/salon", payload).then((r) => r.data);

export const adminUpdateHoraires = (horaires) =>
  api.put("/api/admin/salon/horaires", horaires).then((r) => r.data);


// Indisponibilités
export const adminGetIndisponibilites = () =>
  api.get("/api/admin/indisponibilites").then((r) => r.data);

export const adminCreerIndisponibilite = (payload) =>
  api
    .post("/api/admin/indisponibilites", payload)
    .then((r) => r.data);

export const adminSupprimerIndisponibilite = (id) =>
  api
    .delete(`/api/admin/indisponibilites/${id}`)
    .then((r) => r.data);


// Dashboard
export const adminGetDashboard = () =>
  api.get("/api/admin/dashboard").then((r) => r.data);

export const adminGetCoupesPopulaires = () =>
  api
    .get("/api/admin/dashboard/coupes-populaires")
    .then((r) => r.data);


// Clients
export const adminGetClients = () =>
  api.get("/api/admin/clients").then((r) => r.data);

export const adminGetClient = (id) =>
  api.get(`/api/admin/clients/${id}`).then((r) => r.data);
