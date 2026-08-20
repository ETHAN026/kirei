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

  function renderActions(rdv) {
    const assignable = !['TERMINE', 'ANNULE', 'REFUSE'].includes(rdv.statut);
    return (
      <div className="flex flex-wrap gap-2">
        {rdv.statut === 'EN_ATTENTE' && (
          <>
            <button
              disabled={busyId === rdv.id}
              onClick={() => handleAction(adminValiderRdv, rdv.id)}
              className="rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-semibold text-night hover:bg-sage-500 disabled:opacity-40"
            >
              Valider
            </button>
            <button
              disabled={busyId === rdv.id}
              onClick={() => handleAction(adminRefuserRdv, rdv.id)}
              className="rounded-lg bg-clay-600 px-3 py-1.5 text-xs font-semibold text-night hover:bg-clay-500 disabled:opacity-40"
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
              className="rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-night hover:bg-gold-400 disabled:opacity-40"
            >
              Marquer payé
            </button>
            <button
              disabled={busyId === rdv.id}
              onClick={() => handleAction(adminAnnulerRdv, rdv.id)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-cream/60 hover:text-cream disabled:opacity-40"
            >
              Annuler
            </button>
          </>
        )}
        {assignable && (
          <select
            value={rdv.assistantId || ''}
            disabled={busyId === rdv.id}
            onChange={(e) => handleAssignAssistant(rdv.id, e.target.value)}
            className="rounded-lg border border-line bg-raised px-2 py-1.5 text-xs text-cream focus:border-gold-500 focus:outline-none"
          >
            <option value="">Le coiffeur</option>
            {assistants.map((a) => (
              <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">Rendez-vous</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm ${
              filtre === f.value
                ? 'bg-gold-500 text-night'
                : 'border border-line bg-surface text-cream/60 hover:text-cream'
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
        <p className="mt-10 text-cream/50">Aucun rendez-vous pour ce filtre.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line bg-white/[0.02] text-xs uppercase font-black uppercase tracking-tight text-white/40">
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
                    <tr key={rdv.id} className="border-b border-line/60 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3">
                        {new Date(rdv.dateHeureDebut).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-cream">{rdv.client.prenom} {rdv.client.nom}</p>
                        <p className="text-xs text-cream/40">{rdv.client.telephone}</p>
                      </td>
                      <td className="px-4 py-3">{rdv.coupe.nom}</td>
                      <td className="px-4 py-3">
                        {rdv.lieuPrestation === 'DOMICILE' ? (
                          <span title={rdv.adresseDomicile} className="badge inline-flex items-center gap-1 bg-gold-500/15 text-gold-300">
                            <FiHome size={12} /> Domicile
                          </span>
                        ) : (
                          <span className="badge inline-flex items-center gap-1 bg-cream/10 text-cream/50">
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
                            className="rounded-lg border border-line bg-raised px-2 py-1.5 text-xs text-cream focus:border-gold-500 focus:outline-none"
                          >
                            <option value="">Le coiffeur</option>
                            {assistants.map((a) => (
                              <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-cream/55">
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
                                className="rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-semibold text-night hover:bg-sage-500 disabled:opacity-40"
                              >
                                Valider
                              </button>
                              <button
                                disabled={busyId === rdv.id}
                                onClick={() => handleAction(adminRefuserRdv, rdv.id)}
                                className="rounded-lg bg-clay-600 px-3 py-1.5 text-xs font-semibold text-night hover:bg-clay-500 disabled:opacity-40"
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
                                className="rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-night hover:bg-gold-400 disabled:opacity-40"
                              >
                                Marquer payé
                              </button>
                              <button
                                disabled={busyId === rdv.id}
                                onClick={() => handleAction(adminAnnulerRdv, rdv.id)}
                                className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-cream/60 hover:text-cream disabled:opacity-40"
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

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {rdvs.map((rdv) => (
              <div key={rdv.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-cream">{rdv.client.prenom} {rdv.client.nom}</p>
                    <p className="text-xs text-cream/40">{rdv.client.telephone}</p>
                  </div>
                  <StatutBadge statut={rdv.statut} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-cream/40">Date</span>
                    <p className="text-cream">
                      {new Date(rdv.dateHeureDebut).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-cream/40">Coupe</span>
                    <p className="text-cream">{rdv.coupe.nom}</p>
                  </div>
                  <div>
                    <span className="text-cream/40">Lieu</span>
                    <p className="text-cream">
                      {rdv.lieuPrestation === 'DOMICILE' ? (
                        <span className="inline-flex items-center gap-1 text-gold-300"><FiHome size={11} /> Domicile</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-cream/60"><FiScissors size={11} /> Salon</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-cream/40">Montant</span>
                    <p className="font-medium text-gold-400">{rdv.tarifApplique.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-line pt-3">
                  {renderActions(rdv)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
