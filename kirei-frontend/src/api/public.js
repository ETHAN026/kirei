import api from "./client";

export const getSalon = () =>
  api.get("/api/salon").then((r) => r.data);

export const getCoupes = () =>
  api.get("/api/coupes", {
    params: { actif: true },
  }).then((r) => r.data);

export const getAssistants = () =>
  api.get("/api/assistants").then((r) => r.data);

export const getCreneauxDisponibles = (
  date,
  assistantId
) =>
  api.get("/api/creneaux-disponibles", {
    params: {
      date,
      assistantId: assistantId || undefined,
    },
  }).then((r) => r.data);

export const creerRendezVous = (payload) =>
  api.post("/api/rendez-vous", payload).then((r) => r.data);
