const prisma = require('../config/prisma');

/**
 * Génère les créneaux disponibles pour une date donnée, pour un praticien donné.
 * Se base sur : les horaires d'ouverture du salon, les indisponibilités
 * (congés/pauses), et les RDV déjà EN_ATTENTE/VALIDE/TERMINE ce jour-là.
 *
 * @param {string} dateStr - date au format YYYY-MM-DD
 * @param {string|null} assistantId - si fourni, ne regarde que les créneaux de cet assistant.
 *   Si null/absent, regarde les créneaux du coiffeur lui-même (assistantId = null en base).
 */
async function getCreneauxDisponibles(dateStr, assistantId = null) {
  const salon = await prisma.salon.findFirst({ include: { horaires: true } });
  if (!salon) throw Object.assign(new Error('Salon non configuré.'), { status: 500 });

  const jourDate = new Date(`${dateStr}T00:00:00`);
  const jourSemaine = jourDate.getDay();
  const duree = salon.dureeCreneauMinutes;

  const horaireJour = salon.horaires.find((h) => h.jourSemaine === jourSemaine);
  if (!horaireJour || horaireJour.ferme) return [];

  // Bornes horaires du jour
  const [hDebut, mDebut] = horaireJour.heureDebut.split(':').map(Number);
  const [hFin, mFin] = horaireJour.heureFin.split(':').map(Number);
  const ouverture = new Date(jourDate);
  ouverture.setHours(hDebut, mDebut, 0, 0);
  const fermeture = new Date(jourDate);
  fermeture.setHours(hFin, mFin, 0, 0);

  // Indisponibilités (congés/pauses) qui chevauchent ce jour — s'appliquent à tout le salon
  const finJournee = new Date(jourDate);
  finJournee.setHours(23, 59, 59, 999);
  const indisponibilites = await prisma.indisponibilite.findMany({
    where: {
      salonId: salon.id,
      dateDebut: { lte: finJournee },
      dateFin: { gte: jourDate },
    },
  });

  // RDV déjà occupés ce jour pour CE praticien précis (coiffeur si assistantId=null, sinon l'assistant)
  const rdvOccupes = await prisma.rendezVous.findMany({
    where: {
      dateHeureDebut: { gte: jourDate, lte: finJournee },
      statut: { in: ['EN_ATTENTE', 'VALIDE', 'TERMINE'] },
      assistantId: assistantId || null,
    },
    select: { dateHeureDebut: true, dateHeureFin: true },
  });

  const creneaux = [];
  let curseur = new Date(ouverture);

  while (curseur.getTime() + duree * 60000 <= fermeture.getTime()) {
    const finCreneau = new Date(curseur.getTime() + duree * 60000);

    const chevaucheIndispo = indisponibilites.some(
      (ind) => curseur < new Date(ind.dateFin) && finCreneau > new Date(ind.dateDebut)
    );
    const chevaucheRdv = rdvOccupes.some(
      (r) => curseur < new Date(r.dateHeureFin) && finCreneau > new Date(r.dateHeureDebut)
    );
    const estPasse = curseur < new Date();

    if (!chevaucheIndispo && !chevaucheRdv && !estPasse) {
      creneaux.push({
        debut: curseur.toISOString(),
        fin: finCreneau.toISOString(),
      });
    }

    curseur = finCreneau;
  }

  return creneaux;
}

module.exports = { getCreneauxDisponibles };
