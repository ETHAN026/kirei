const prisma = require('../config/prisma');

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=dimanche
  const diff = (day === 0 ? -6 : 1) - day; // lundi comme début de semaine
  x.setDate(x.getDate() + diff);
  return x;
}
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfYear(d) { return new Date(d.getFullYear(), 0, 1); }

async function sommeCA(where) {
  const result = await prisma.rendezVous.aggregate({
    where: { statut: 'TERMINE', ...where },
    _sum: { tarifApplique: true },
    _count: true,
  });
  return {
    total: result._sum.tarifApplique || 0,
    nombreRendezVous: result._count || 0,
  };
}

// GET /api/admin/dashboard  (admin — CA sur 5 périodes : Jour/Semaine/Mois/Année/Total)
async function dashboard(req, res) {
  const now = new Date();

  const [jour, semaine, mois, annee, total] = await Promise.all([
    sommeCA({ dateHeureDebut: { gte: startOfDay(now) } }),
    sommeCA({ dateHeureDebut: { gte: startOfWeek(now) } }),
    sommeCA({ dateHeureDebut: { gte: startOfMonth(now) } }),
    sommeCA({ dateHeureDebut: { gte: startOfYear(now) } }),
    sommeCA({}),
  ]);

  const [enAttente, valides] = await Promise.all([
    prisma.rendezVous.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.rendezVous.count({ where: { statut: 'VALIDE' } }),
  ]);

  res.json({
    chiffreAffaires: { jour, semaine, mois, annee, total },
    rendezVousEnAttente: enAttente,
    rendezVousValidesAVenir: valides,
  });
}

// GET /api/admin/dashboard/coupes-populaires  (top des coupes les plus vendues)
async function coupesPopulaires(req, res) {
  const rdvTermines = await prisma.rendezVous.groupBy({
    by: ['coupeId'],
    where: { statut: 'TERMINE' },
    _count: { coupeId: true },
    _sum: { tarifApplique: true },
    orderBy: { _count: { coupeId: 'desc' } },
    take: 10,
  });

  const coupeIds = rdvTermines.map((r) => r.coupeId);
  const coupes = await prisma.coupe.findMany({ where: { id: { in: coupeIds } } });
  const coupeMap = Object.fromEntries(coupes.map((c) => [c.id, c]));

  res.json(
    rdvTermines.map((r) => ({
      coupe: coupeMap[r.coupeId],
      nombreVentes: r._count.coupeId,
      chiffreAffaires: r._sum.tarifApplique,
    }))
  );
}

module.exports = { dashboard, coupesPopulaires };
