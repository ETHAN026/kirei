import { useEffect, useState } from 'react';
import { adminGetDashboard, adminGetCoupesPopulaires } from '../../api/admin';
import Loader from '../../components/Loader';
import { FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';

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
      <h1 className="font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">Tableau de bord</h1>
      <p className="mt-1 text-cream/45">Chiffre d'affaires calculé sur les rendez-vous terminés (payés).</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {PERIODES.map((p) => (
          <div key={p.key} className="card !p-3 sm:!p-4">
            <p className="text-[10px] font-medium uppercase font-black uppercase tracking-tight text-white/40 sm:text-xs">{p.label}</p>
            <p className="mt-1 font-display text-lg text-gold-400 sm:mt-2 sm:text-2xl">
              {data.chiffreAffaires[p.key].total.toLocaleString('fr-FR')} <span className="text-xs sm:text-sm">FCFA</span>
            </p>
            <p className="mt-0.5 text-[10px] text-cream/40 sm:mt-1 sm:text-xs">
              {data.chiffreAffaires[p.key].nombreRendezVous} RDV
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase font-black uppercase tracking-tight text-white/40 sm:text-xs">En attente</p>
            <p className="mt-1 font-display text-2xl text-gold-300 sm:mt-2 sm:text-3xl">{data.rendezVousEnAttente}</p>
          </div>
          <FiClock className="text-gold-400/70" size={24} />
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase font-black uppercase tracking-tight text-white/40 sm:text-xs">Validés, à venir</p>
            <p className="mt-1 font-display text-2xl text-sage-500 sm:mt-2 sm:text-3xl">{data.rendezVousValidesAVenir}</p>
          </div>
          <FiCalendar className="text-sage-500/70" size={24} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-base font-black uppercase tracking-tight text-white sm:text-lg">
          <FiTrendingUp className="text-gold-400" /> Coupes les plus vendues
        </h2>
        {populaires.length === 0 ? (
          <p className="mt-3 text-sm text-cream/50">Pas encore assez de données.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {populaires.map((p) => (
              <div key={p.coupe?.id} className="card flex items-center justify-between !py-3">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-cream text-sm">{p.coupe?.nom}</p>
                </div>
                <div className="text-right text-xs sm:text-sm">
                  <p className="text-cream/55">{p.nombreVentes} ventes</p>
                  <p className="font-medium text-gold-400">{p.chiffreAffaires.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
