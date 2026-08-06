import { useEffect, useState } from 'react';
import { assistantGetRendezVous } from '../../api/assistant';
import Loader from '../../components/Loader';
import StatutBadge from '../../components/StatutBadge';
import { FiHome, FiScissors, FiPhone } from 'react-icons/fi';

const FILTRES = [
  { value: '', label: 'Tous' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'VALIDE', label: 'Validés' },
  { value: 'TERMINE', label: 'Terminés' },
];

export default function AssistantRendezVous() {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = filtre ? { statut: filtre } : {};
    assistantGetRendezVous(params).then((data) => {
      setRdvs(data);
      setLoading(false);
    });
  }, [filtre]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Mes rendez-vous</h1>
      <p className="mt-1 text-ink/50">Les rendez-vous que le coiffeur vous a attribués.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtre === f.value ? 'bg-plum-600 text-white' : 'bg-white text-ink/60 hover:text-ink border border-ink/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : rdvs.length === 0 ? (
        <p className="mt-10 text-ink/50">Aucun rendez-vous pour ce filtre.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rdvs.map((rdv) => (
            <div key={rdv.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-ink">
                    {new Date(rdv.dateHeureDebut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">{rdv.coupe.nom} · {rdv.tarifApplique.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <StatutBadge statut={rdv.statut} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink/10 pt-4 text-sm text-ink/70">
                <span className="font-medium text-ink">{rdv.client.prenom} {rdv.client.nom}</span>
                <span className="flex items-center gap-1.5">
                  <FiPhone size={13} /> {rdv.client.telephone}
                </span>
                {rdv.lieuPrestation === 'DOMICILE' ? (
                  <span className="flex items-center gap-1.5 text-gold-600">
                    <FiHome size={13} /> {rdv.adresseDomicile}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FiScissors size={13} /> Au salon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
