const prisma = require('../config/prisma');

// GET /api/salon  (public — infos vitrine)
async function getSalon(req, res) {
  const salon = await prisma.salon.findFirst({ include: { horaires: true } });
  if (!salon) return res.status(404).json({ error: 'Salon non configuré.' });
  res.json(salon);
}

// PUT /api/admin/salon  (admin — mise à jour des paramètres)
async function updateSalon(req, res) {
  const { nomEnseigne, adresse, telephone, email, logoUrl, dureeCreneauMinutes } = req.body;
  const salon = await prisma.salon.findFirst();
  if (!salon) return res.status(404).json({ error: 'Salon non configuré.' });

  const updated = await prisma.salon.update({
    where: { id: salon.id },
    data: {
      ...(nomEnseigne !== undefined && { nomEnseigne }),
      ...(adresse !== undefined && { adresse }),
      ...(telephone !== undefined && { telephone }),
      ...(email !== undefined && { email }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(dureeCreneauMinutes !== undefined && { dureeCreneauMinutes: Number(dureeCreneauMinutes) }),
    },
  });
  res.json(updated);
}

// PUT /api/admin/salon/horaires  (admin — remplace les horaires hebdomadaires)
// body: [{ jourSemaine: 0-6, heureDebut: "09:00", heureFin: "18:00", ferme: false }, ...]
async function updateHoraires(req, res) {
  const horaires = req.body;
  if (!Array.isArray(horaires)) {
    return res.status(400).json({ error: 'Le corps doit être un tableau d\'horaires.' });
  }

  const salon = await prisma.salon.findFirst();
  if (!salon) return res.status(404).json({ error: 'Salon non configuré.' });

  await prisma.$transaction([
    prisma.horaireOuverture.deleteMany({ where: { salonId: salon.id } }),
    prisma.horaireOuverture.createMany({
      data: horaires.map((h) => ({
        salonId: salon.id,
        jourSemaine: h.jourSemaine,
        heureDebut: h.heureDebut,
        heureFin: h.heureFin,
        ferme: !!h.ferme,
      })),
    }),
  ]);

  const updated = await prisma.salon.findFirst({ include: { horaires: true } });
  res.json(updated);
}

// GET /api/admin/indisponibilites
async function listIndisponibilites(req, res) {
  const salon = await prisma.salon.findFirst();
  const indispos = await prisma.indisponibilite.findMany({
    where: { salonId: salon.id },
    orderBy: { dateDebut: 'asc' },
  });
  res.json(indispos);
}

// POST /api/admin/indisponibilites  (admin — ajouter un congé/pause)
async function creerIndisponibilite(req, res) {
  const { dateDebut, dateFin, motif } = req.body;
  if (!dateDebut || !dateFin) {
    return res.status(400).json({ error: 'dateDebut et dateFin sont obligatoires.' });
  }

  const salon = await prisma.salon.findFirst();
  const indispo = await prisma.indisponibilite.create({
    data: {
      salonId: salon.id,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      motif: motif || null,
    },
  });
  res.status(201).json(indispo);
}

// DELETE /api/admin/indisponibilites/:id
async function supprimerIndisponibilite(req, res) {
  await prisma.indisponibilite.delete({ where: { id: req.params.id } });
  res.json({ message: 'Indisponibilité supprimée.' });
}

module.exports = {
  getSalon,
  updateSalon,
  updateHoraires,
  listIndisponibilites,
  creerIndisponibilite,
  supprimerIndisponibilite,
};
