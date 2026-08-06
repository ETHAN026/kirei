import { useEffect, useState } from 'react';
import {
  adminGetRendezVous,
  adminValiderRdv,
  adminRefuserRdv,
  adminTerminerRdv,
  adminAnnulerRdv,
  adminAssignerAssistant,
  adminGetAssistants,
} from '../../api/admin';
import Loader from '../../components/Loader';
import StatutBadge from '../../components/StatutBadge';
import { ErrorMessage } from '../../components/Messages';
import { FiHome, FiScissors } from 'react-icons/fi';

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
  const [assistants, setAssistants] = useState([]);
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
    adminGetAssistants().then(setAssistants);
  }, []);

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

  async function handleAssignAssistant(id, assistantId) {
    setError('');
    setBusyId(id);
    try {
      await adminAssignerAssistant(id, assistantId || null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Attribution impossible.");
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
                <th className="px-4 py-3">Lieu</th>
                <th className="px-4 py-3">Praticien</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rdvs.map((rdv) => {
                const assignable = !['TERMINE', 'ANNULE', 'REFUSE'].includes(rdv.statut);
                return (
                  <tr key={rdv.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(rdv.dateHeureDebut).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{rdv.client.prenom} {rdv.client.nom}</p>
                      <p className="text-xs text-ink/45">{rdv.client.telephone}</p>
                    </td>
                    <td className="px-4 py-3">{rdv.coupe.nom}</td>
                    <td className="px-4 py-3">
                      {rdv.lieuPrestation === 'DOMICILE' ? (
                        <span title={rdv.adresseDomicile} className="badge inline-flex items-center gap-1 bg-gold-400/20 text-gold-600">
                          <FiHome size={12} /> Domicile
                        </span>
                      ) : (
                        <span className="badge inline-flex items-center gap-1 bg-ink/10 text-ink/50">
                          <FiScissors size={12} /> Salon
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {assignable ? (
                        <select
                          value={rdv.assistantId || ''}
                          disabled={busyId === rdv.id}
                          onChange={(e) => handleAssignAssistant(rdv.id, e.target.value)}
                          className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-xs text-ink focus:border-plum-500 focus:outline-none"
                        >
                          <option value="">Le coiffeur</option>
                          {assistants.map((a) => (
                            <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-ink/60">
                          {rdv.assistant ? `${rdv.assistant.prenom} ${rdv.assistant.nom}` : 'Le coiffeur'}
                        </span>
                      )}
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
