const prisma = require('../config/prisma');

const WITH_PHOTOS = { photos: { orderBy: { position: 'asc' } } };

// GET /api/coupes  (public — catalogue pour les clients)
async function listCoupes(req, res) {
  const { actif } = req.query;
  const where = {};
  if (actif !== undefined) where.actif = actif === 'true';

  const coupes = await prisma.coupe.findMany({
    where,
    include: WITH_PHOTOS,
    orderBy: { createdAt: 'desc' },
  });
  res.json(coupes);
}

// GET /api/coupes/:id
async function getCoupe(req, res) {
  const coupe = await prisma.coupe.findUnique({ where: { id: req.params.id }, include: WITH_PHOTOS });
  if (!coupe) return res.status(404).json({ error: 'Coupe introuvable.' });
  res.json(coupe);
}

function validateDomicile(domicileDisponible, prixDomicileFcfa) {
  const actif = domicileDisponible === true || domicileDisponible === 'true';
  if (actif && (prixDomicileFcfa === undefined || prixDomicileFcfa === null || Number(prixDomicileFcfa) <= 0)) {
    return 'Un prix à domicile valide est requis si le service à domicile est activé pour cette coupe.';
  }
  return null;
}

// POST /api/admin/coupes  (admin — création, sans photos : gérées séparément)
async function createCoupe(req, res) {
  const { nom, description, prixFcfa, domicileDisponible, prixDomicileFcfa } = req.body;
  if (!nom || !prixFcfa) {
    return res.status(400).json({ error: 'Le nom et le prix sont obligatoires.' });
  }

  const domicileError = validateDomicile(domicileDisponible, prixDomicileFcfa);
  if (domicileError) return res.status(400).json({ error: domicileError });

  const coupe = await prisma.coupe.create({
    data: {
      nom,
      description: description || null,
      prixFcfa: Number(prixFcfa),
      domicileDisponible: domicileDisponible === true || domicileDisponible === 'true',
      prixDomicileFcfa: prixDomicileFcfa ? Number(prixDomicileFcfa) : null,
    },
    include: WITH_PHOTOS,
  });

  res.status(201).json(coupe);
}

// PUT /api/admin/coupes/:id  (admin — modification des infos uniquement, pas des photos)
async function updateCoupe(req, res) {
  const existing = await prisma.coupe.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Coupe introuvable.' });

  const { nom, description, prixFcfa, actif, domicileDisponible, prixDomicileFcfa } = req.body;

  const domicileActifFinal =
    domicileDisponible !== undefined ? (domicileDisponible === true || domicileDisponible === 'true') : existing.domicileDisponible;
  const prixDomicileFinal = prixDomicileFcfa !== undefined ? prixDomicileFcfa : existing.prixDomicileFcfa;
  const domicileError = validateDomicile(domicileActifFinal, prixDomicileFinal);
  if (domicileError) return res.status(400).json({ error: domicileError });

  const data = {};
  if (nom !== undefined) data.nom = nom;
  if (description !== undefined) data.description = description;
  if (prixFcfa !== undefined) data.prixFcfa = Number(prixFcfa);
  if (actif !== undefined) data.actif = actif === 'true' || actif === true;
  if (domicileDisponible !== undefined) data.domicileDisponible = domicileActifFinal;
  if (prixDomicileFcfa !== undefined) data.prixDomicileFcfa = prixDomicileFcfa === '' ? null : Number(prixDomicileFcfa);

  const coupe = await prisma.coupe.update({ where: { id: req.params.id }, data, include: WITH_PHOTOS });
  res.json(coupe);
}

// DELETE /api/admin/coupes/:id  (admin — supprime aussi ses photos, cascade DB + fichiers)
async function deleteCoupe(req, res) {
  const existing = await prisma.coupe.findUnique({ where: { id: req.params.id }, include: WITH_PHOTOS });
  if (!existing) return res.status(404).json({ error: 'Coupe introuvable.' });

  const enUsage = await prisma.rendezVous.count({
    where: { coupeId: req.params.id, statut: { in: ['EN_ATTENTE', 'VALIDE'] } },
  });
  if (enUsage > 0) {
    return res.status(409).json({
      error: 'Impossible de supprimer : des rendez-vous en cours utilisent cette coupe. Désactivez-la plutôt.',
    });
  }

  const { deletePhotoFile } = require('./coupePhotoController');
  existing.photos.forEach((p) => deletePhotoFile(p.url));

  await prisma.coupe.delete({ where: { id: req.params.id } }); // cascade supprime les Photo en DB
  res.json({ message: 'Coupe supprimée.' });
}

module.exports = { listCoupes, getCoupe, createCoupe, updateCoupe, deleteCoupe };
