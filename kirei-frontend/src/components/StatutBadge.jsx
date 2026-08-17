const STYLES = {
  EN_ATTENTE: 'bg-gold-500/15 text-gold-300',
  VALIDE: 'bg-sage-500/15 text-sage-500',
  TERMINE: 'bg-cream/10 text-cream/70',
  REFUSE: 'bg-clay-500/15 text-clay-500',
  ANNULE: 'bg-cream/5 text-cream/40',
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
    <span className={`badge ${STYLES[statut] || 'bg-cream/10 text-cream/60'}`}>
      {LABELS[statut] || statut}
    </span>
  );
}