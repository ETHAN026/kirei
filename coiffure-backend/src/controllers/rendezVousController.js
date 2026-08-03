const prisma = require('../config/prisma');
const { getCreneauxDisponibles } = require('../services/disponibiliteService');
const emailService = require('../services/emailService');

const RDV_INCLUDE = { client: true, coupe: true };

// GET /api/creneaux-disponibles?date=YYYY-MM-DD  (public)
async function creneauxDisponibles(req, res) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Le paramètre "date" (YYYY-MM-DD) est requis.' });

  const creneaux = await getCreneauxDisponibles(date);
  res.json(creneaux);
}

// POST /api/rendez-vous  (public — création par le client)
async function creerRendezVous(req, res) {
  const { nom, prenom, email, telephone, adresse, coupeId, dateHeureDebut } = req.body;

  if (!nom || !prenom || !email || !telephone || !coupeId || !dateHeureDebut) {
    return res.status(400).json({
      error: 'nom, prenom, email, telephone, coupeId et dateHeureDebut sont obligatoires.',
    });
  }

  const coupe = await prisma.coupe.findUnique({ where: { id: coupeId } });
  if (!coupe || !coupe.actif) {
    return res.status(404).json({ error: 'Coupe introuvable ou indisponible.' });
  }

  const salon = await prisma.salon.findFirst();
  if (!salon) return res.status(500).json({ error: 'Salon non configuré.' });

  const debut = new Date(dateHeureDebut);
  if (Number.isNaN(debut.getTime()) || debut < new Date()) {
    return res.status(400).json({ error: 'Date de rendez-vous invalide ou déjà passée.' });
  }
  const fin = new Date(debut.getTime() + salon.dureeCreneauMinutes * 60000);

  // Vérifie que le créneau est toujours libre (anti double-réservation)
  const conflit = await prisma.rendezVous.findFirst({
    where: {
      statut: { in: ['EN_ATTENTE', 'VALIDE', 'TERMINE'] },
      dateHeureDebut: { lt: fin },
      dateHeureFin: { gt: debut },
    },
  });
  if (conflit) {
    return res.status(409).json({ error: 'Ce créneau vient d\'être réservé, merci d\'en choisir un autre.' });
  }

  const client = await prisma.client.create({
    data: { nom, prenom, email, telephone, adresse: adresse || null },
  });

  const rdv = await prisma.rendezVous.create({
    data: {
      clientId: client.id,
      coupeId: coupe.id,
      tarifApplique: coupe.prixFcfa,
      dateHeureDebut: debut,
      dateHeureFin: fin,
      statut: 'EN_ATTENTE',
    },
    include: RDV_INCLUDE,
  });

  if (salon.email) {
    emailService.notifyAdminNouvelleDemande(salon.email, rdv);
  }
  emailService.notifyClientAccuseReception(rdv);

  res.status(201).json(rdv);
}

// GET /api/admin/rendez-vous?statut=&from=&to=  (admin — calendrier / liste)
async function listRendezVous(req, res) {
  const { statut, from, to } = req.query;
  const where = {};
  if (statut) where.statut = statut;
  if (from || to) {
    where.dateHeureDebut = {};
    if (from) where.dateHeureDebut.gte = new Date(from);
    if (to) where.dateHeureDebut.lte = new Date(to);
  }

  const rdvs = await prisma.rendezVous.findMany({
    where,
    include: RDV_INCLUDE,
    orderBy: { dateHeureDebut: 'asc' },
  });
  res.json(rdvs);
}

// GET /api/admin/rendez-vous/:id
async function getRendezVous(req, res) {
  const rdv = await prisma.rendezVous.findUnique({
    where: { id: req.params.id },
    include: RDV_INCLUDE,
  });
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  res.json(rdv);
}

async function changerStatut(req, res, statutCible, notifier) {
  const rdv = await prisma.rendezVous.findUnique({ where: { id: req.params.id }, include: RDV_INCLUDE });
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable.' });

  const updated = await prisma.rendezVous.update({
    where: { id: req.params.id },
    data: { statut: statutCible, notesAdmin: req.body?.notesAdmin ?? rdv.notesAdmin },
    include: RDV_INCLUDE,
  });

  if (notifier) await notifier(updated);
  res.json(updated);
}

// PATCH /api/admin/rendez-vous/:id/valider  (EN_ATTENTE -> VALIDE)
async function validerRendezVous(req, res) {
  const rdv = await prisma.rendezVous.findUnique({ where: { id: req.params.id } });
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  if (rdv.statut !== 'EN_ATTENTE') {
    return res.status(409).json({ error: `Impossible de valider un RDV au statut ${rdv.statut}.` });
  }
  return changerStatut(req, res, 'VALIDE', emailService.notifyClientAcceptation);
}

// PATCH /api/admin/rendez-vous/:id/refuser  (EN_ATTENTE -> REFUSE)
async function refuserRendezVous(req, res) {
  const rdv = await prisma.rendezVous.findUnique({ where: { id: req.params.id } });
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  if (rdv.statut !== 'EN_ATTENTE') {
    return res.status(409).json({ error: `Impossible de refuser un RDV au statut ${rdv.statut}.` });
  }
  return changerStatut(req, res, 'REFUSE', emailService.notifyClientRefus);
}

// PATCH /api/admin/rendez-vous/:id/terminer  (VALIDE -> TERMINE, prestation faite + encaissée -> compte dans le CA)
async function terminerRendezVous(req, res) {
  const rdv = await prisma.rendezVous.findUnique({ where: { id: req.params.id } });
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  if (rdv.statut !== 'VALIDE') {
    return res.status(409).json({ error: 'Seul un RDV validé peut être marqué comme terminé.' });
  }
  return changerStatut(req, res, 'TERMINE', null);
}

// PATCH /api/admin/rendez-vous/:id/annuler
async function annulerRendezVous(req, res) {
  const rdv = await prisma.rendezVous.findUnique({ where: { id: req.params.id } });
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  if (['TERMINE', 'ANNULE', 'REFUSE'].includes(rdv.statut)) {
    return res.status(409).json({ error: `Impossible d'annuler un RDV au statut ${rdv.statut}.` });
  }
  return changerStatut(req, res, 'ANNULE', emailService.notifyClientAnnulation);
}

module.exports = {
  creneauxDisponibles,
  creerRendezVous,
  listRendezVous,
  getRendezVous,
  validerRendezVous,
  refuserRendezVous,
  terminerRendezVous,
  annulerRendezVous,
};
