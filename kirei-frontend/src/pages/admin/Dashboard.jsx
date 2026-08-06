import { useEffect, useState } from 'react';
import { adminGetDashboard, adminGetCoupesPopulaires } from '../../api/admin';
import Loader from '../../components/Loader';
import { FiClock, FiCalendar } from 'react-icons/fi';

const PERIODES = [
  { key: 'jour', label: "Aujourd'hui" },
  { key: 'semaine', label: 'Cette semaine' },
  { key: 'mois', label: 'Ce mois' },
  { key: 'annee', label: 'Cette année' },
  { key: 'total', label: 'Total' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [populaires, setPopulaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminGetDashboard(), adminGetCoupesPopulaires()]).then(([d, p]) => {
      setData(d);
      setPopulaires(p);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Tableau de bord</h1>
      <p className="mt-1 text-ink/50">Chiffre d'affaires calculé sur les rendez-vous terminés (payés).</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PERIODES.map((p) => (
          <div key={p.key} className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{p.label}</p>
            <p className="mt-2 font-display text-2xl text-plum-600">
              {data.chiffreAffaires[p.key].total.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
            </p>
            <p className="mt-1 text-xs text-ink/40">
              {data.chiffreAffaires[p.key].nombreRendezVous} rendez-vous
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">En attente de validation</p>
            <p className="mt-2 font-display text-3xl text-gold-600">{data.rendezVousEnAttente}</p>
          </div>
          <FiClock className="text-gold-500" size={28} />
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Validés, à venir</p>
            <p className="mt-2 font-display text-3xl text-plum-600">{data.rendezVousValidesAVenir}</p>
          </div>
          <FiCalendar className="text-plum-500" size={28} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl text-ink">Coupes les plus vendues</h2>
        {populaires.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">Pas encore assez de données.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {populaires.map((p) => (
              <div key={p.coupe?.id} className="card flex items-center justify-between !py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-plum-50">
                    {p.coupe?.photos?.[0] && (
                      <img src={p.coupe.photos[0].url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="font-medium text-ink">{p.coupe?.nom}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-ink/60">{p.nombreVentes} ventes</p>
                  <p className="font-medium text-plum-600">{p.chiffreAffaires.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
