const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const PUBLIC_SELECT = { id: true, nom: true, prenom: true };
const ADMIN_SELECT = { id: true, nom: true, prenom: true, email: true, telephone: true, actif: true, createdAt: true };

// GET /api/assistants  (public — liste des assistants actifs, pour que le client choisisse)
async function listAssistantsPublic(req, res) {
  const assistants = await prisma.assistant.findMany({
    where: { actif: true },
    select: PUBLIC_SELECT,
    orderBy: { prenom: 'asc' },
  });
  res.json(assistants);
}

// GET /api/admin/assistants  (admin — liste complète)
async function adminListAssistants(req, res) {
  const assistants = await prisma.assistant.findMany({
    select: ADMIN_SELECT,
    orderBy: { createdAt: 'desc' },
  });
  res.json(assistants);
}

// POST /api/admin/assistants  (admin — création)
async function adminCreateAssistant(req, res) {
  const { nom, prenom, email, telephone, password } = req.body;
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ error: 'nom, prenom, email et password sont obligatoires.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const assistant = await prisma.assistant.create({
    data: { nom, prenom, email, telephone: telephone || null, passwordHash },
    select: ADMIN_SELECT,
  });

  res.status(201).json(assistant);
}

// PUT /api/admin/assistants/:id  (admin — modification, mot de passe optionnel)
async function adminUpdateAssistant(req, res) {
  const existing = await prisma.assistant.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Assistant introuvable.' });

  const { nom, prenom, email, telephone, actif, password } = req.body;
  const data = {};
  if (nom !== undefined) data.nom = nom;
  if (prenom !== undefined) data.prenom = prenom;
  if (email !== undefined) data.email = email;
  if (telephone !== undefined) data.telephone = telephone;
  if (actif !== undefined) data.actif = actif === true || actif === 'true';
  if (password) {
    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const assistant = await prisma.assistant.update({
    where: { id: req.params.id },
    data,
    select: ADMIN_SELECT,
  });
  res.json(assistant);
}

// DELETE /api/admin/assistants/:id  (admin)
async function adminDeleteAssistant(req, res) {
  const existing = await prisma.assistant.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Assistant introuvable.' });

  const enCours = await prisma.rendezVous.count({
    where: { assistantId: req.params.id, statut: { in: ['EN_ATTENTE', 'VALIDE'] } },
  });
  if (enCours > 0) {
    return res.status(409).json({
      error: "Impossible de supprimer : cet assistant a des rendez-vous en cours. Désactivez-le plutôt.",
    });
  }

  await prisma.assistant.delete({ where: { id: req.params.id } });
  res.json({ message: 'Assistant supprimé.' });
}

// GET /api/assistant/rendez-vous  (assistant connecté — ses propres RDV uniquement)
async function mesRendezVous(req, res) {
  const { statut, from, to } = req.query;
  const where = { assistantId: req.assistant.id };
  if (statut) where.statut = statut;
  if (from || to) {
    where.dateHeureDebut = {};
    if (from) where.dateHeureDebut.gte = new Date(from);
    if (to) where.dateHeureDebut.lte = new Date(to);
  }

  const rdvs = await prisma.rendezVous.findMany({
    where,
    include: { client: true, coupe: true },
    orderBy: { dateHeureDebut: 'asc' },
  });
  res.json(rdvs);
}

module.exports = {
  listAssistantsPublic,
  adminListAssistants,
  adminCreateAssistant,
  adminUpdateAssistant,
  adminDeleteAssistant,
  mesRendezVous,
};
