import { useEffect, useState } from 'react';
import { adminGetDashboard, adminGetCoupesPopulaires } from '../../api/admin';
import Loader from '../../components/Loader';

// Importation des icônes depuis react-icons
import { 
  FiClock, 
  FiCalendar, 
  FiTrendingUp, 
  FiScissors, 
  FiDollarSign,
  FiShoppingBag
} from 'react-icons/fi';

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
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="font-display text-3xl text-ink">Tableau de bord</h1>
        <p className="mt-1 text-sm text-ink/50">
          Chiffre d'affaires calculé sur les rendez-vous terminés (payés).
        </p>
      </div>

      {/* Cartes Chiffre d'affaires par période */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PERIODES.map((p) => (
          <div key={p.key} className="card relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                {p.label}
              </p>
              <FiTrendingUp className="text-plum-600/40 text-base" />
            </div>
            
            <p className="mt-3 font-display text-2xl text-plum-600">
              {data.chiffreAffaires[p.key].total.toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans text-ink/60">FCFA</span>
            </p>
            
            <div className="mt-2 flex items-center gap-1.5 text-xs text-ink/50">
              <FiShoppingBag className="text-ink/40" />
              <span>{data.chiffreAffaires[p.key].nombreRendezVous} rdv</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes d'états des rendez-vous */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
              En attente de validation
            </p>
            <p className="mt-2 font-display text-3xl text-gold-600">
              {data.rendezVousEnAttente}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600">
            <FiClock className="text-2xl" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
              Validés, à venir
            </p>
            <p className="mt-2 font-display text-3xl text-plum-600">
              {data.rendezVousValidesAVenir}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-plum-50 text-plum-600">
            <FiCalendar className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Section des coupes populaires */}
      <div>
        <div className="flex items-center gap-2">
          <FiScissors className="text-ink/60 text-lg" />
          <h2 className="font-display text-xl text-ink">Coupes les plus vendues</h2>
        </div>

        {populaires.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">Pas encore assez de données.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {populaires.map((p) => (
              <div key={p.coupe?.id} className="card flex items-center justify-between !py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-plum-50 text-plum-600">
                    {p.coupe?.photos?.[0] ? (
                      <img 
                        src={p.coupe.photos[0]} 
                        alt={p.coupe?.nom || 'Coupe'} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <FiScissors className="text-lg" />
                    )}
                  </div>
                  <p className="font-medium text-ink">{p.coupe?.nom}</p>
                </div>
                
                <div className="text-right text-sm">
                  <p className="text-xs text-ink/60">{p.nombreVentes} ventes</p>
                  <p className="font-medium text-plum-600">
                    {p.chiffreAffaires.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}