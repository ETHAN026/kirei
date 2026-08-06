import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSalon, getCoupes } from '../../api/public';
import Loader from '../../components/Loader';
import { FiMapPin,FiStar } from 'react-icons/fi';

export default function Home() {
  const [salon, setSalon] = useState(null);
  const [coupes, setCoupes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSalon().catch(() => null), getCoupes().catch(() => [])]).then(
      ([s, c]) => {
        setSalon(s);
        setCoupes(c.slice(0, 3));
        setLoading(false);
      }
    );
  }, []);

  return (
    <div>
      {/* Hero */}
     <section className="relative overflow-hidden border-b border-ink/10 bg-gradient-to-b from-plum-50/30 to-transparent">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
        {/* Colonne Gauche : Contenu */}
        <div>
          <h1 className="font-display flex flex-col gap-3 leading-tight text-ink sm:text-6xl">
            La coupe parfaite,
            <br />
            <span className="text-plum-600">sans file d'attente.</span>
          </h1>

          <p className="mt-6 max-w-md text-ink/70 text-base leading-relaxed">
            {salon?.nomEnseigne || 'Notre salon'} vous permet de choisir votre coiffure, votre créneau et
            de confirmer votre rendez-vous en quelques clics — où que vous soyez, à toute heure.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/reserver" className="btn-primary">
              Réserver un créneau
            </Link>
            <Link to="/coupes" className="btn-secondary">
              Voir le catalogue
            </Link>
          </div>

          {salon?.adresse && (
            <p className="mt-8 flex items-center gap-2 text-sm text-ink/60">
              <FiMapPin className="text-plum-600" size={16} /> 
              <span>{salon.adresse} {salon.telephone && `· ${salon.telephone}`}</span>
            </p>
          )}
        </div>

        {/* Colonne Droite : Galerie Photos & Badges Flottants */}
        <div className="relative mt-6 lg:mt-0">
          {/* Arrière-plan décoratif (Glow) */}
          <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-tr from-plum-200/60 to-plum-100/30 blur-2xl" />

          {/* Grille de 2 images décalées */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* Image 1 */}
            <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl shadow-xl border border-white/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop"
                alt="Coiffure au salon"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60" />
            </div>

            {/* Image 2 (Décalée vers le bas) */}
            <div className="group relative mt-8 aspect-[3/4] overflow-hidden rounded-3xl shadow-xl border border-white/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop"
                alt="Coupe de cheveux homme/femme"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Aperçu catalogue */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-plum-600">Notre savoir-faire</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Coupes populaires</h2>
          </div>
          <Link to="/coupes" className="btn-ghost">Tout voir →</Link>
        </div>

        {loading ? (
          <Loader />
        ) : coupes.length === 0 ? (
          <p className="text-ink/50">Le catalogue sera bientôt disponible.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {coupes.map((c) => (
              <Link
                key={c.id}
                to="/reserver"
                state={{ coupeId: c.id }}
                className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-plum-50">
                  {c.photos?.[0] ? (
                    <img
                      src={c.photos[0].url}
                      alt={c.nom}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-plum-300">Pas de photo</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-display text-lg text-ink">{c.nom}</p>
                  <p className="mt-1 text-sm font-medium text-plum-600">{c.prixFcfa} FCFA</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
