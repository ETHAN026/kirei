import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCoupes } from '../../api/public';
import Reveal from '../../components/Reveal';
import Loader from '../../components/Loader';
import { FiArrowUpRight, FiHome } from 'react-icons/fi';

const FALLBACK = [
  { id: 'fallback-1', nom: 'Coupe classique', prixFcfa: 3000, prixDomicileFcfa: 5000, domicileDisponible: true },
  { id: 'fallback-2', nom: 'Dégradé', prixFcfa: 3500, prixDomicileFcfa: null, domicileDisponible: false },
  { id: 'fallback-3', nom: 'Barbe', prixFcfa: 2500, prixDomicileFcfa: null, domicileDisponible: false },
  { id: 'fallback-4', nom: 'Coupe + barbe', prixFcfa: 5000, prixDomicileFcfa: 7000, domicileDisponible: true },
];

export default function Catalogue() {
  const [coupes, setCoupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    getCoupes()
      .then(setCoupes)
      .finally(() => setLoading(false));
  }, []);

  const services = coupes.length ? coupes : FALLBACK;

  return (
    <div className="page-enter">
      {/* En-tête éditorial */}
      <header className="relative mx-auto max-w-[1400px] overflow-hidden px-5 pt-32 md:px-10 md:pt-44">
        <p className="mono-label fade-up text-night/50" style={{ '--d': '0.1s' }}>
          Catalogue — {String(services.length).padStart(2, '0')} prestations
        </p>
        <h1 className="mt-5 font-display font-black uppercase leading-[0.85] tracking-tight text-night">
          <span className="hero-line block text-[clamp(2rem,6vw,5.5rem)]">
            <span style={{ '--d': '0.25s' }}>NOS</span>
          </span>
          <span className="hero-line block">
            <span className="outline-text" style={{ '--d': '0.4s' }}>
              PRESTATIONS
            </span>
          </span>
        </h1>
        <Reveal delay={250} className="mt-8 max-w-sm md:ml-auto">
          <p className="text-sm leading-relaxed text-night/55">
            Parcourez la liste — chaque prestation ouvre la réservation directement.
          </p>
        </Reveal>
      </header>

      {/* Liste éditoriale */}
      <section className="relative mx-auto max-w-[1400px] px-5 pb-28 pt-16 md:px-10">
        {loading ? (
          <Loader />
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-[6%] z-10 hidden w-[320px] items-center lg:flex">
              {services.map((s, i) => (
                <img
                  key={s.id}
                  src={s.photos?.[0]?.url || `https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=900&auto=format&fit=crop`}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className={`img-bw absolute inset-0 h-[380px] w-full object-cover transition-all duration-500 ${
                    active === i ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>

            <div>
              {services.map((s, i) => (
                <Link
                  key={s.id}
                  to="/reserver"
                  state={{ coupeId: s.id }}
                  className="service-row group"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(-1)}
                >
                  <span className="font-mono text-[11px] text-night/40 transition-colors duration-500 group-hover:text-white/40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex flex-col justify-center gap-1.5">
                    <span className="font-display text-[clamp(1.3rem,3vw,2.4rem)] font-black uppercase leading-none tracking-tight">
                      {s.nom}
                    </span>
                    <span className="row-extra flex items-center gap-3 font-mono text-[10px] uppercase tracking-wide2">
                      {s.domicileDisponible && (
                        <span className="flex items-center gap-1.5">
                          <FiHome size={11} /> Domicile · {s.prixDomicileFcfa?.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="row-extra flex items-baseline gap-3 font-mono text-xs tracking-wide">
                    <span className="hidden text-[10px] uppercase sm:inline">
                      {s.prixFcfa.toLocaleString('fr-FR')} FCFA
                    </span>
                    <FiArrowUpRight className="row-arrow" size={20} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bande noire de fin */}
      <section className="overflow-hidden bg-night py-6">
        <p
          className="whitespace-nowrap text-center font-display text-[clamp(1.2rem,3vw,2.6rem)] font-black uppercase leading-none tracking-tight"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', color: 'transparent' }}
          aria-hidden
        >
          RÉSERVER · RÉSERVER · RÉSERVER
        </p>
      </section>
    </div>
  );
}
