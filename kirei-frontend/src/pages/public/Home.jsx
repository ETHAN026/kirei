import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSalon, getCoupes, getAssistants } from '../../api/public';
import Reveal from '../../components/Reveal';
import Counter from '../../components/Counter';
import RevealLines from '../../components/RevealLines';
import SectionHeading from '../../components/SectionHeading';
import BookingCTA from '../../components/BookingCTA';
import LightOverlay from '../../components/LightOverlay';
import VideoSlot from '../../components/VideoSlot';
import Loader from '../../components/Loader';
import { FiArrowUpRight, FiMapPin, FiPhone } from 'react-icons/fi';

/* ============ MÉDIAS LOCAUX ============ */
const SALON_VIDEO = '/videos/salon.mp4';
const HERO_IMG = '/images/hero.jpg';
const SALON_IMG = '/images/salon.jpg';

const GALLERY_FALLBACKS = [
  '/images/gallery-01.jpg',
  '/images/gallery-02.jpg',
  '/images/gallery-03.jpg',
  '/images/gallery-04.jpg',
  '/images/gallery-05.jpg',
  '/images/gallery-06.jpg',
  '/images/gallery-07.jpg',
  '/images/gallery-08.jpg',
];

const FALLBACK_SERVICES = [
  { nom: 'Coupe classique', prixFcfa: 3000, description: 'Coupe, shampooing, coiffage.' },
  { nom: 'Dégradé', prixFcfa: 3500, description: 'Fade net aux ciseaux ou à la tondeuse.' },
  { nom: 'Barbe', prixFcfa: 2500, description: 'Taille, contours, soin chaud.' },
  { nom: 'Coupe + barbe', prixFcfa: 5000, description: 'Le rituel complet UltraBarber.' },
];

/* --- Galerie en grille masonry --- */
function MasonryGallery({ panels }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative bg-night text-white py-20 md:py-28" aria-label="Galerie">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <p className="mono-label mb-10 text-clay-500">05 — Galerie</p>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {panels.map((p, i) => (
            <figure
              key={i}
              className={`group relative mb-4 overflow-hidden break-inside-avoid ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transition: `opacity 0.7s ${i * 0.08}s, transform 0.7s ${i * 0.08}s` }}
            >
              <img
                src={p.img}
                alt={p.caption}
                loading="lazy"
                className="img-bw h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="mono-label absolute bottom-3 left-3 flex items-center gap-2 text-white/80 mix-blend-difference">
                <span className="text-white/50">0{i + 1}</span>
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/reserver" className="btn-underline text-white" aria-label="Réserver">
            Réserver <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [salon, setSalon] = useState(null);
  const [coupes, setCoupes] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState(-1);

  useEffect(() => {
    Promise.all([
      getSalon().catch(() => null),
      getCoupes().catch(() => []),
      getAssistants().catch(() => []),
    ]).then(([s, c, a]) => {
      setSalon(s);
      setCoupes(c.slice(0, 4));
      setAssistants(a);
      setLoading(false);
    });
  }, []);

  const services = coupes.length ? coupes : FALLBACK_SERVICES;
  const previewImgs = services.map(
    (s, i) => s.photos?.[0]?.url || GALLERY_FALLBACKS[i % GALLERY_FALLBACKS.length]
  );

  const galleryPanels = [
    ...(coupes.length
      ? coupes.map((c, i) => ({
          img: c.photos?.[0]?.url || GALLERY_FALLBACKS[i],
          caption: c.nom,
        }))
      : []),
    ...GALLERY_FALLBACKS.map((img, i) => ({
      img,
      caption: ['Session fade', 'Travail de dégradé', 'Lignes & contours', 'Texture', 'Finitions', 'Atelier', 'Détails', 'Style'][i],
    })),
  ];

  return (
    <div className="page-enter">
      {/* ============ 01 — HERO (vidéo de fond) ============ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Vidéo de fond */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            poster={HERO_IMG}
          >
            <source src="/videos/atelier-01.mp4" type="video/mp4" />
          </video>
          {/* Overlay sombre pour lisibilité */}
          <div className="absolute inset-0 bg-black/55" />
          {/* Gradient en bas */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <LightOverlay />

        {/* Méta supérieure */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-28 md:px-10">
          <p className="mono-label fade-up text-cream/50" style={{ '--d': '2.05s' }}>
            No°001 — Luxury barber studio
          </p>
          <p className="mono-label fade-up text-cream/50" style={{ '--d': '2.15s' }}>
            {salon?.adresse ? 'YND — ' : ''}Réservation en ligne
          </p>
        </div>

        {/* Typographie monumentale */}
        <h1 className="relative z-10 mt-6 px-5 font-display font-black uppercase leading-[0.85] tracking-tight text-white md:mt-10 md:px-10">
          <span className="hero-line block text-[clamp(2.2rem,9vw,9rem)]">
            <span style={{ '--d': '1.75s' }}>ULTRA</span>
          </span>
          <span className="hero-line block text-[clamp(2.2rem,9vw,9rem)]">
            <span style={{ '--d': '1.9s' }}><span className="text-clay-500">BAR</span><span>BER</span></span>
          </span>
        </h1>

        {/* Image artistique (sort de la grille) */}
        <div className="pointer-events-none absolute right-4 top-[26%] z-0 hidden w-[24vw] max-w-[400px] overflow-hidden lg:block">
          <div className="hero-line" style={{ '--d': '2.2s' }}>
            <div className="fade-up" style={{ '--d': '2.4s' }}>
              <div className="relative aspect-[3/4]">
                <img
                  src={HERO_IMG}
                  alt="Coupe réalisée au studio UltraBarber"
                  className="h-full w-full object-cover"
                />
                <span className="absolute -bottom-5 -left-5 h-16 w-16 border-b border-l border-white/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Zone basse */}
        <div className="relative z-10 mt-auto grid gap-10 px-5 pb-8 pt-14 md:px-10 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="fade-up flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wide2 text-cream/55" style={{ '--d': '2.3s' }}>
            {salon?.adresse && (
              <span className="flex items-center gap-2">
                <FiMapPin size={12} /> {salon.adresse}
              </span>
            )}
            {salon?.telephone && (
              <span className="flex items-center gap-2">
                <FiPhone size={12} /> {salon.telephone}
              </span>
            )}
            <span>Lun — Sam · 09h00 — 20h00</span>
          </div>

          <div className="fade-up hidden flex-col items-center gap-3 lg:flex" style={{ '--d': '2.45s' }}>
            <span className="h-12 w-px animate-pulse bg-white/30" />
            <span className="mono-label rotate-90 text-white/40">Scroll</span>
          </div>

          <div className="fade-up flex justify-start lg:justify-end" style={{ '--d': '2.5s' }}>
            <BookingCTA />
          </div>
        </div>
      </section>

      {/* ============ 02 — PRESTATIONS ============ */}
      <section className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading index="02" label="Prestations" lines={'CE QUE NOUS\nFAISONS'} />
          <Reveal delay={200} className="max-w-xs">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-wide2 text-night/45">
              Des lignes nettes, des finitions précises. Chaque prestation est un rituel.
            </p>
          </Reveal>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="relative mt-14">
            {/* Aperçu image au survol (desktop) */}
            <div className="pointer-events-none absolute inset-y-0 right-[7%] z-10 hidden w-[300px] items-center lg:flex">
              {previewImgs.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className={`img-bw absolute inset-0 h-[340px] w-full object-cover transition-all duration-500 ${
                    activeService === i ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <span className="absolute -bottom-4 -right-4 h-14 w-14 border-b border-r border-night/30" />
            </div>

            <div>
              {services.map((s, i) => (
                <Link
                  key={s.id ?? i}
                  to="/reserver"
                  state={s.id ? { coupeId: s.id } : undefined}
                  className="service-row group"
                  onMouseEnter={() => setActiveService(i)}
                  onMouseLeave={() => setActiveService(-1)}
                >
                  <span className="font-mono text-[11px] text-night/40 transition-colors duration-500 group-hover:text-white/40">
                    0{i + 1}
                  </span>
                  <span className="font-display text-[clamp(1.05rem,2.4vw,1.8rem)] font-black uppercase leading-none tracking-tight">
                    {s.nom}
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

      {/* ============ Bande défilante (marquee) ============ */}
      <section className="relative overflow-hidden border-y border-white/10 bg-night py-5 md:py-6">
        <div className="marquee-track">
          {[...Array(3)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 items-center">
              {[
                { intl: 'CUT', fr: 'Coupe' },
                { intl: 'FADE', fr: 'Dégradé' },
                { intl: 'BEARD', fr: 'Barbe' },
                { intl: 'LINE-UP', fr: 'Contour' },
                { intl: 'TAPER', fr: 'Affûtage' },
                { intl: 'DESIGN', fr: 'Motif' },
              ].map((item, i) => (
                <div key={`${setIdx}-${i}`} className="flex items-center gap-6 px-6">
                  <div className="flex flex-col items-center">
                    <span
                      className="font-display text-[clamp(1.2rem,2.5vw,2.2rem)] font-black uppercase leading-none tracking-tight"
                      style={{ WebkitTextStroke: '1px rgba(255,255,255,0.35)', color: 'transparent' }}
                    >
                      {item.intl}
                    </span>
                    <span className="mono-label mt-1 text-clay-500/80">{item.fr}</span>
                  </div>
                  <span className="text-clay-500/40">·</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============ 03 — GALERIE (masonry) ============ */}
      <MasonryGallery panels={galleryPanels} />

      {/* ============ 04 — LE STUDIO ============ */}
      <section className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <div className="grid grid-cols-12 gap-x-5 gap-y-10 lg:gap-0">
          <div className="col-span-12 min-w-0 lg:col-span-7">
            <Reveal variant="scale">
              <div className="relative overflow-hidden">
                <VideoSlot
                  src={SALON_VIDEO}
                  poster={SALON_IMG}
                  mono
                  className="aspect-[4/3] w-full lg:aspect-[7/5]"
                />
                <span className="absolute bottom-4 left-4 z-10 bg-paper/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide2 text-night/70">
                  Le studio — film 01
                </span>
              </div>
            </Reveal>
          </div>
          <div className="col-span-12 flex min-w-0 flex-col justify-center lg:col-span-5 lg:-ml-10 lg:mt-32 lg:pl-16">
            <p className="mono-label text-night/50">04 — Le studio</p>
            <h2 className="mt-4 font-display font-black uppercase leading-[0.88] tracking-tight text-night">
              <RevealLines
                text={'UN RITUEL\nQUI VOUS\nRESSEMBLE'}
                className="text-[clamp(1.6rem,3.6vw,3.2rem)]"
              />
            </h2>
            <Reveal delay={200}>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-night/60">
                Un cadre pensé comme une galerie : lumière, précision, silence.
                Le temps de votre coupe, rien d'autre ne compte.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-black/15 pt-6">
                {[
                  { end: 24, suffix: '/7', label: 'Réservation' },
                  { end: coupes.length, suffix: '', label: 'Prestations' },
                  { end: assistants.length || 1, suffix: '', label: 'Praticiens' },
                ].map((s) => (
                  <div key={s.label}>
                    <dd className="font-display text-2xl font-black tracking-tight text-night sm:text-3xl">
                      <Counter end={s.end} suffix={s.suffix} />
                    </dd>
                    <dt className="mono-label mt-2 text-night/45">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      </div>
  );
}
