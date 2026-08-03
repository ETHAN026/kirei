function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Cette valeur existe déjà (conflit d\'unicité).' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Ressource introuvable.' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erreur serveur inattendue.' });
}

module.exports = errorHandler;
