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

/* --- Galerie horizontale pilotée par le scroll (desktop) --- */
function HorizontalGallery({ panels }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 1023px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || isMobile) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const shift = (track.scrollWidth - window.innerWidth) * p;
      track.style.transform = `translate3d(${-shift}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className={`relative bg-night text-white ${isMobile ? '' : 'h-[300vh]'}`}
      aria-label="Galerie"
    >
      <div className={`flex flex-col ${isMobile ? '' : 'sticky top-0 h-screen overflow-hidden'}`}>
        <div
          ref={trackRef}
          className={`flex items-center gap-6 px-5 md:gap-12 md:px-10 ${
            isMobile
              ? 'h-[76vh] min-w-0 snap-x snap-mandatory overflow-x-auto pb-8'
              : 'h-full w-max will-change-transform'
          }`}
        >
          {panels.map((p, i) => (
            <figure
              key={i}
              data-cursor="VIEW"
              className="group relative shrink-0 snap-center overflow-hidden"
              style={{ width: p.w, height: p.tall ? '74vh' : '58vh' }}
            >
              <img
                src={p.img}
                alt={p.caption}
                loading="lazy"
                className="img-bw h-full w-full object-cover"
              />
              <figcaption className="mono-label absolute bottom-4 left-4 flex items-center gap-3 text-white/80 mix-blend-difference">
                <span className="text-white/50">0{i + 1}</span>
                {p.caption}
              </figcaption>
            </figure>
          ))}
          <div
            className="flex shrink-0 flex-col items-start justify-center gap-6 px-6 md:px-14"
            style={{ width: 'min(80vw, 640px)' }}
          >
            <p className="mono-label text-white/50">05 — Galerie</p>
            <RevealLines
              text={'VOTRE COUPE\nNOUS ATTEND'}
              className="font-display text-[clamp(1.6rem,3vw,2.8rem)] font-black uppercase leading-[0.9] tracking-tight"
              lineClassName="outline-text"
            />
            <Link
              to="/reserver"
              className="btn-underline text-white"
              aria-label="Réserver"
            >
              Réserver <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>
        {!isMobile && (
          <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10">
            <div className="h-px w-full bg-white/15">
              <div ref={barRef} className="h-px w-full origin-left scale-x-0 bg-white" />
            </div>
          </div>
        )}
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
          w: ['min(40vw, 620px)', 'min(28vw, 440px)', 'min(34vw, 520px)'][i % 3],
          tall: i % 2 === 0,
        }))
      : []),
    ...GALLERY_FALLBACKS.map((img, i) => ({
      img,
      caption: ['Session fade', 'Travail de dégradé', 'Lignes & contours', 'Texture', 'Finitions', 'Atelier', 'Détails', 'Style'][i],
      w: ['min(40vw, 620px)', 'min(26vw, 420px)', 'min(32vw, 500px)'][i % 3],
      tall: i % 2 === 0,
    })),
  ];

  return (
    <div className="page-enter">
      {/* ============ 01 — HERO ============ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-paper">
        <LightOverlay />

        {/* Méta supérieure */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-28 md:px-10">
          <p className="mono-label fade-up text-night/50" style={{ '--d': '2.05s' }}>
            No°001 — Luxury barber studio
          </p>
          <p className="mono-label fade-up text-night/50" style={{ '--d': '2.15s' }}>
            {salon?.adresse ? 'YND — ' : ''}Réservation en ligne
          </p>
        </div>

        {/* Typographie monumentale */}
        <h1 className="relative z-10 mt-6 font-display font-black uppercase leading-[0.85] tracking-tight text-night md:mt-10">
          <span className="hero-line ml-[-2vw] block text-[clamp(2.2rem,9vw,9rem)]">
            <span style={{ '--d': '1.75s' }}>ULTRA</span>
          </span>
          <span className="hero-line ml-[5vw] block text-[clamp(2.2rem,9vw,9rem)]">
            <span style={{ '--d': '1.9s' }}>BARBER</span>
          </span>
        </h1>

        {/* Image artistique (sort de la grille) */}
        <div className="pointer-events-none absolute right-4 top-[26%] z-0 hidden w-[24vw] max-w-[400px] overflow-hidden lg:block">
          <div className="hero-line" style={{ '--d': '2.2s' }}>
            <div className="fade-up" style={{ '--d': '2.4s' }}>
              <div className="relative aspect-[3/4] bg-night/5">
                <img
                  src={HERO_IMG}
                  alt="Coupe réalisée au studio UltraBarber"
                  className="img-bw h-full w-full object-cover"
                />
                <span className="absolute -bottom-5 -left-5 h-16 w-16 border-b border-l border-night/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Bâtons de barbier — déplacés en pied de page */}

        {/* Zone basse */}
        <div className="relative z-10 mt-auto grid gap-10 px-5 pb-8 pt-14 md:px-10 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="fade-up flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wide2 text-night/55" style={{ '--d': '2.3s' }}>
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
            <span className="h-12 w-px animate-pulse bg-night/30" />
            <span className="mono-label rotate-90 text-night/40">Scroll</span>
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

      {/* ============ Transition typographique ============ */}
      <section className="overflow-hidden border-y border-white/10 bg-night py-4 md:py-6">
        <h2
          className="whitespace-nowrap text-center font-display text-[clamp(1.2rem,3vw,2.6rem)] font-black uppercase leading-none tracking-tight"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.28)', color: 'transparent' }}
          aria-hidden
        >
          CUT · FADE · BEARD · LINE-UP · CUT · FADE
        </h2>
      </section>

      {/* ============ 03 — GALERIE (scroll horizontal) ============ */}
      <HorizontalGallery panels={galleryPanels} />

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
