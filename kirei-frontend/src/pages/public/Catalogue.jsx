import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCoupes } from '../../api/public';
import Loader from '../../components/Loader';
import { FiHome } from 'react-icons/fi';

export default function Catalogue() {
  const [coupes, setCoupes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoupes()
      .then(setCoupes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-plum-600">Catalogue</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Nos coupes &amp; prestations</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Parcourez nos styles et choisissez celui qui vous inspire — vous pourrez ensuite réserver
        directement le créneau de votre choix.
      </p>

      {loading ? (
        <Loader />
      ) : coupes.length === 0 ? (
        <p className="mt-10 text-ink/50">Aucune coupe disponible pour le moment.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coupes.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <div className="grid grid-cols-3 gap-px bg-ink/10">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="aspect-square overflow-hidden bg-plum-50">
                    {c.photos?.[i] ? (
                      <img src={c.photos[i].url} alt={`${c.nom} ${i + 1}`} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="p-5">
                <p className="font-display text-xl text-ink">{c.nom}</p>
                {c.description && <p className="mt-1 text-sm text-ink/55">{c.description}</p>}
                {c.domicileDisponible && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-gold-600">
                    <FiHome size={12} /> À domicile : {c.prixDomicileFcfa} FCFA
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-plum-600">{c.prixFcfa} FCFA</span>
                  <Link to="/reserver" state={{ coupeId: c.id }} className="btn-secondary !py-2 !px-4">
                    Réserver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
