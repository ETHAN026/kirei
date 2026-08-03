const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

function toPublicUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/coupes/${filename}`;
}

// GET /api/coupes  (public — catalogue pour les clients)
async function listCoupes(req, res) {
  const { actif } = req.query;
  const where = {};
  if (actif !== undefined) where.actif = actif === 'true';

  const coupes = await prisma.coupe.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(coupes);
}

// GET /api/coupes/:id
async function getCoupe(req, res) {
  const coupe = await prisma.coupe.findUnique({ where: { id: req.params.id } });
  if (!coupe) return res.status(404).json({ error: 'Coupe introuvable.' });
  res.json(coupe);
}

// POST /api/admin/coupes  (admin — création avec upload jusqu'à 3 photos)
async function createCoupe(req, res) {
  const { nom, description, prixFcfa } = req.body;
  if (!nom || !prixFcfa) {
    return res.status(400).json({ error: 'Le nom et le prix sont obligatoires.' });
  }

  const files = req.files || [];
  const photos = files.map((f) => toPublicUrl(req, f.filename));

  const coupe = await prisma.coupe.create({
    data: {
      nom,
      description: description || null,
      prixFcfa: Number(prixFcfa),
      photos,
    },
  });

  res.status(201).json(coupe);
}

// PUT /api/admin/coupes/:id  (admin — modification, remplace les photos si de nouvelles sont envoyées)
async function updateCoupe(req, res) {
  const existing = await prisma.coupe.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Coupe introuvable.' });

  const { nom, description, prixFcfa, actif } = req.body;
  const data = {};
  if (nom !== undefined) data.nom = nom;
  if (description !== undefined) data.description = description;
  if (prixFcfa !== undefined) data.prixFcfa = Number(prixFcfa);
  if (actif !== undefined) data.actif = actif === 'true' || actif === true;

  const files = req.files || [];
  if (files.length > 0) {
    // Supprime les anciennes photos physiques avant de les remplacer
    existing.photos.forEach((url) => {
      const filename = url.split('/uploads/coupes/')[1];
      const filepath = path.join(__dirname, '..', '..', 'uploads', 'coupes', filename);
      fs.unlink(filepath, () => {});
    });
    data.photos = files.map((f) => toPublicUrl(req, f.filename));
  }

  const coupe = await prisma.coupe.update({ where: { id: req.params.id }, data });
  res.json(coupe);
}

// DELETE /api/admin/coupes/:id  (admin)
async function deleteCoupe(req, res) {
  const existing = await prisma.coupe.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Coupe introuvable.' });

  const enUsage = await prisma.rendezVous.count({
    where: { coupeId: req.params.id, statut: { in: ['EN_ATTENTE', 'VALIDE'] } },
  });
  if (enUsage > 0) {
    return res.status(409).json({
      error: 'Impossible de supprimer : des rendez-vous en cours utilisent cette coupe. Désactivez-la plutôt.',
    });
  }

  existing.photos.forEach((url) => {
    const filename = url.split('/uploads/coupes/')[1];
    const filepath = path.join(__dirname, '..', '..', 'uploads', 'coupes', filename);
    fs.unlink(filepath, () => {});
  });

  await prisma.coupe.delete({ where: { id: req.params.id } });
  res.json({ message: 'Coupe supprimée.' });
}

module.exports = { listCoupes, getCoupe, createCoupe, updateCoupe, deleteCoupe };
