import { useEffect, useState } from 'react';
import {
  adminGetRendezVous,
  adminValiderRdv,
  adminRefuserRdv,
  adminTerminerRdv,
  adminAnnulerRdv,
} from '../../api/admin';
import Loader from '../../components/Loader';
import StatutBadge from '../../components/StatutBadge';
import { ErrorMessage } from '../../components/Messages';

const FILTRES = [
  { value: '', label: 'Tous' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'VALIDE', label: 'Validés' },
  { value: 'TERMINE', label: 'Terminés' },
  { value: 'REFUSE', label: 'Refusés' },
  { value: 'ANNULE', label: 'Annulés' },
];

export default function RendezVousAdmin() {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const params = filtre ? { statut: filtre } : {};
    const data = await adminGetRendezVous(params);
    setRdvs(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  async function handleAction(action, id) {
    setError('');
    setBusyId(id);
    try {
      await action(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Action impossible.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Rendez-vous</h1>
      </div>

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

      <div className="mt-4"><ErrorMessage>{error}</ErrorMessage></div>

      {loading ? (
        <Loader />
      ) : rdvs.length === 0 ? (
        <p className="mt-10 text-ink/50">Aucun rendez-vous pour ce filtre.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3">Date & heure</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Coupe</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rdvs.map((rdv) => (
                <tr key={rdv.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(rdv.dateHeureDebut).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{rdv.client.prenom} {rdv.client.nom}</p>
                    <p className="text-xs text-ink/45">{rdv.client.telephone}</p>
                  </td>
                  <td className="px-4 py-3">{rdv.coupe.nom}</td>
                  <td className="px-4 py-3">{rdv.tarifApplique.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3"><StatutBadge statut={rdv.statut} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {rdv.statut === 'EN_ATTENTE' && (
                        <>
                          <button
                            disabled={busyId === rdv.id}
                            onClick={() => handleAction(adminValiderRdv, rdv.id)}
                            className="rounded-lg bg-sage-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-600 disabled:opacity-40"
                          >
                            Valider
                          </button>
                          <button
                            disabled={busyId === rdv.id}
                            onClick={() => handleAction(adminRefuserRdv, rdv.id)}
                            className="rounded-lg bg-clay-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-clay-600 disabled:opacity-40"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                      {rdv.statut === 'VALIDE' && (
                        <>
                          <button
                            disabled={busyId === rdv.id}
                            onClick={() => handleAction(adminTerminerRdv, rdv.id)}
                            className="rounded-lg bg-plum-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-plum-700 disabled:opacity-40"
                          >
                            Marquer payé
                          </button>
                          <button
                            disabled={busyId === rdv.id}
                            onClick={() => handleAction(adminAnnulerRdv, rdv.id)}
                            className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60 hover:text-ink disabled:opacity-40"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
