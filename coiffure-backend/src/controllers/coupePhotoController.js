const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

const MAX_PHOTOS_PAR_COUPE = 3;

function toPublicUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/coupes/${filename}`;
}

function deletePhotoFile(url) {
  const filename = url.split('/uploads/coupes/')[1];
  if (!filename) return;
  const filepath = path.join(__dirname, '..', '..', 'uploads', 'coupes', filename);
  fs.unlink(filepath, () => {});
}

// POST /api/admin/coupes/:id/photos  (admin — ajoute UNE photo, sans toucher aux autres)
async function addPhoto(req, res) {
  const coupe = await prisma.coupe.findUnique({
    where: { id: req.params.id },
    include: { photos: true },
  });
  if (!coupe) return res.status(404).json({ error: 'Coupe introuvable.' });

  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu (champ "photo" attendu).' });
  }

  if (coupe.photos.length >= MAX_PHOTOS_PAR_COUPE) {
    deletePhotoFile(toPublicUrl(req, req.file.filename)); // nettoie le fichier orphelin uploadé
    return res.status(409).json({ error: `Maximum ${MAX_PHOTOS_PAR_COUPE} photos par coupe. Supprimez-en une d'abord.` });
  }

  const position = coupe.photos.length;
  const photo = await prisma.photo.create({
    data: {
      coupeId: coupe.id,
      url: toPublicUrl(req, req.file.filename),
      position,
    },
  });

  res.status(201).json(photo);
}

// DELETE /api/admin/coupes/:id/photos/:photoId  (admin — supprime UNE photo précise)
async function deletePhoto(req, res) {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.photoId } });
  if (!photo || photo.coupeId !== req.params.id) {
    return res.status(404).json({ error: 'Photo introuvable pour cette coupe.' });
  }

  deletePhotoFile(photo.url);
  await prisma.photo.delete({ where: { id: photo.id } });

  res.json({ message: 'Photo supprimée.' });
}

module.exports = { addPhoto, deletePhoto, deletePhotoFile };
