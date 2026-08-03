const STYLES = {
  EN_ATTENTE: 'bg-gold-400/20 text-gold-600',
  VALIDE: 'bg-plum-100 text-plum-600',
  TERMINE: 'bg-sage-500/15 text-sage-600',
  REFUSE: 'bg-clay-500/10 text-clay-600',
  ANNULE: 'bg-ink/10 text-ink/50',
};

const LABELS = {
  EN_ATTENTE: 'En attente',
  VALIDE: 'Validé',
  TERMINE: 'Terminé',
  REFUSE: 'Refusé',
  ANNULE: 'Annulé',
};

export default function StatutBadge({ statut }) {
  return (
    <span className={`badge ${STYLES[statut] || 'bg-ink/10 text-ink/60'}`}>
      {LABELS[statut] || statut}
    </span>
  );
}
