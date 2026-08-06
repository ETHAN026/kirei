import { useEffect, useState } from 'react';
import { adminGetClients, adminGetClient } from '../../api/admin';
import Loader from '../../components/Loader';
import StatutBadge from '../../components/StatutBadge';

export default function ClientsAdmin() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    adminGetClients().then((data) => {
      setClients(data);
      setLoading(false);
    });
  }, []);

  async function openClient(id) {
    setLoadingDetail(true);
    const data = await adminGetClient(id);
    setSelected(data);
    setLoadingDetail(false);
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Clients</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white lg:col-span-3">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">RDV</th>
                <th className="px-4 py-3">Total payé</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-ink/45">{c.telephone} · {c.email}</p>
                  </td>
                  <td className="px-4 py-3">{c.nombreRendezVous}</td>
                  <td className="px-4 py-3 font-medium text-plum-600">{c.totalPaye.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openClient(c.id)} className="btn-ghost !py-1 !px-3 text-xs">
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && <p className="p-6 text-sm text-ink/50">Aucun client enregistré.</p>}
        </div>

        <div className="lg:col-span-2">
          {loadingDetail ? (
            <Loader />
          ) : !selected ? (
            <div className="card text-center text-sm text-ink/45">Sélectionnez un client pour voir son historique.</div>
          ) : (
            <div className="card">
              <p className="font-display text-xl text-ink">{selected.prenom} {selected.nom}</p>
              <p className="text-sm text-ink/50">{selected.telephone} · {selected.email}</p>
              <p className="mt-3 text-sm">
                Total payé : <span className="font-medium text-plum-600">{selected.totalPaye.toLocaleString('fr-FR')} FCFA</span>
              </p>

              <div className="mt-4 space-y-2 border-t border-ink/10 pt-4">
                {selected.rendezVous.map((rdv) => (
                  <div key={rdv.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-ink">{rdv.coupe.nom}</p>
                      <p className="text-xs text-ink/45">
                        {new Date(rdv.dateHeureDebut).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <StatutBadge statut={rdv.statut} />
                  </div>
                ))}
                {selected.rendezVous.length === 0 && (
                  <p className="text-sm text-ink/45">Aucun rendez-vous.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
