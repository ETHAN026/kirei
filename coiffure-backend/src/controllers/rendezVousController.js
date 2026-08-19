const prisma = require('../config/prisma');
const { getCreneauxDisponibles } = require('../services/disponibiliteService');
const emailService = require('../services/emailService');

const RDV_INCLUDE = { client: true, coupe: true, assistant: { select: { id: true, nom: true, prenom: true } } };

// GET /api/creneaux-disponibles?date=YYYY-MM-DD&assistantId=  (public)
async function creneauxDisponibles(req, res) {
  const { date, assistantId } = req.query;
  if (!date) return res.status(400).json({ error: 'Le paramètre "date" (YYYY-MM-DD) est requis.' });

  const creneaux = await getCreneauxDisponibles(date, assistantId || null);
  res.json(creneaux);
}

// POST /api/rendez-vous  (public — création par le client)
async function creerRendezVous(req, res) {
  const { nom, prenom, email, telephone, adresse, coupeId, dateHeureDebut, lieuPrestation, adresseDomicile, assistantId } = req.body;

  if (!nom || !prenom || !email || !telephone || !coupeId || !dateHeureDebut) {
    return res.status(400).json({
      error: 'nom, prenom, email, telephone, coupeId et dateHeureDebut sont obligatoires.',
    });
  }

  const lieu = lieuPrestation === 'DOMICILE' ? 'DOMICILE' : 'SALON';

  const coupe = await prisma.coupe.findUnique({ where: { id: coupeId } });
  if (!coupe || !coupe.actif) {
    return res.status(404).json({ error: 'Coupe introuvable ou indisponible.' });
  }

  // Si un assistant précis est demandé, vérifie qu'il existe et est actif
  let assistant = null;
  if (assistantId) {
    assistant = await prisma.assistant.findUnique({ where: { id: assistantId } });
    if (!assistant || !assistant.actif) {
      return res.status(404).json({ error: 'Assistant introuvable ou indisponible.' });
    }
  }

  const salon = await prisma.salon.findFirst();
  if (!salon) return res.status(500).json({ error: 'Salon non configuré.' });

  // Service à domicile : dépend de la coupe choisie (chaque coupe a son propre tarif domicile).
  let tarifApplique = coupe.prixFcfa;
  if (lieu === 'DOMICILE') {
    if (!coupe.domicileDisponible || coupe.prixDomicileFcfa == null) {
      return res.status(400).json({ error: "Cette coupe n'est pas proposée à domicile actuellement." });
    }
    if (!adresseDomicile || !adresseDomicile.trim()) {
      return res.status(400).json({ error: 'Une adresse est requise pour une prestation à domicile.' });
    }
    tarifApplique = coupe.prixDomicileFcfa;
  }

  const debut = new Date(dateHeureDebut);
  if (Number.isNaN(debut.getTime()) || debut < new Date()) {
    return res.status(400).json({ error: 'Date de rendez-vous invalide ou déjà passée.' });
  }
  const fin = new Date(debut.getTime() + salon.dureeCreneauMinutes * 60000);

  // Vérifie que le créneau est toujours libre POUR CE PRATICIEN (anti double-réservation)
  const conflit = await prisma.rendezVous.findFirst({
    where: {
      statut: { in: ['EN_ATTENTE', 'VALIDE', 'TERMINE'] },
      assistantId: assistantId || null,
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
      assistantId: assistantId || null,
      tarifApplique,
      lieuPrestation: lieu,
      adresseDomicile: lieu === 'DOMICILE' ? adresseDomicile.trim() : null,
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

  // Réponse immédiate — l'e-mail part en arrière-plan
  res.json(updated);
  if (notifier) notifier(updated).catch((e) => console.error('[mailer] échec notification:', e.message));
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

// PATCH /api/admin/rendez-vous/:id/assistant  (admin — attribue ou change l'assistant assigné)
// body: { assistantId: string | null }
async function assignerAssistant(req, res) {
  const rdv = await prisma.rendezVous.findUnique({ where: { id: req.params.id } });
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  if (['TERMINE', 'ANNULE', 'REFUSE'].includes(rdv.statut)) {
    return res.status(409).json({ error: `Impossible de modifier l'assistant d'un RDV au statut ${rdv.statut}.` });
  }

  const { assistantId } = req.body;

  if (assistantId) {
    const assistant = await prisma.assistant.findUnique({ where: { id: assistantId } });
    if (!assistant || !assistant.actif) {
      return res.status(404).json({ error: 'Assistant introuvable ou inactif.' });
    }
    // Vérifie que cet assistant est libre sur ce créneau (hors ce RDV lui-même)
    const conflit = await prisma.rendezVous.findFirst({
      where: {
        id: { not: rdv.id },
        assistantId,
        statut: { in: ['EN_ATTENTE', 'VALIDE', 'TERMINE'] },
        dateHeureDebut: { lt: rdv.dateHeureFin },
        dateHeureFin: { gt: rdv.dateHeureDebut },
      },
    });
    if (conflit) {
      return res.status(409).json({ error: 'Cet assistant a déjà un rendez-vous sur ce créneau.' });
    }
  }

  const updated = await prisma.rendezVous.update({
    where: { id: req.params.id },
    data: { assistantId: assistantId || null },
    include: RDV_INCLUDE,
  });

  res.json(updated);
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
  assignerAssistant,
};
