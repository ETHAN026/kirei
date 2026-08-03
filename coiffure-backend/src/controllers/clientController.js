const prisma = require('../config/prisma');

// GET /api/admin/clients  (admin — liste avec récap)
async function listClients(req, res) {
  const clients = await prisma.client.findMany({
    include: { rendezVous: true },
    orderBy: { createdAt: 'desc' },
  });

  const data = clients.map((c) => {
    const termines = c.rendezVous.filter((r) => r.statut === 'TERMINE');
    return {
      id: c.id,
      nom: c.nom,
      prenom: c.prenom,
      email: c.email,
      telephone: c.telephone,
      nombreRendezVous: c.rendezVous.length,
      totalPaye: termines.reduce((sum, r) => sum + r.tarifApplique, 0),
      createdAt: c.createdAt,
    };
  });

  res.json(data);
}

// GET /api/admin/clients/:id  (admin — fiche détaillée + historique complet)
async function getClient(req, res) {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: {
      rendezVous: {
        include: { coupe: true },
        orderBy: { dateHeureDebut: 'desc' },
      },
    },
  });
  if (!client) return res.status(404).json({ error: 'Client introuvable.' });

  const totalPaye = client.rendezVous
    .filter((r) => r.statut === 'TERMINE')
    .reduce((sum, r) => sum + r.tarifApplique, 0);

  res.json({ ...client, totalPaye });
}

module.exports = { listClients, getClient };
