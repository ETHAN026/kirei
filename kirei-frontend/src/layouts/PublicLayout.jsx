import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';
import Preloader from '../components/Preloader';
import CustomCursor from '../components/CustomCursor';
import Emblem from '../components/Emblem';
import BarberPole from '../components/BarberPole';
import { FiMenu, FiX, FiArrowUpRight } from 'react-icons/fi';

const navLink = ({ isActive }) =>
  `nav-link transition ${
    isActive ? 'is-active text-night' : 'text-night/55 hover:text-night'
  }`;

const MOBILE_LINKS = [
  { to: '/', label: 'Accueil', index: '01' },
  { to: '/coupes', label: 'Prestations', index: '02' },
  { to: '/reserver', label: 'Réserver', index: '03' },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaderDone(true), 1700);
    const t2 = setTimeout(() => setLoaderGone(true), 2650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {!loaderGone && <Preloader exit={loaderDone} />}
      <CustomCursor />

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled || menuOpen
            ? 'border-b border-black/10 bg-paper/90 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
          <Logo dark />
          <nav className="hidden items-center gap-9 md:flex">
            <NavLink to="/" end className={navLink}>
              Accueil
            </NavLink>
            <NavLink to="/coupes" className={navLink}>
              Prestations
            </NavLink>
            <NavLink
              to="/reserver"
              className="ml-2 inline-flex items-center gap-2 bg-night px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-neutral-700"
            >
              Réserver <FiArrowUpRight size={13} />
            </NavLink>
          </nav>
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center border border-black/15 text-night md:hidden"
            aria-label="Ouvrir le menu"
          >
            <FiMenu size={19} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <Logo dark />
            <button
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center border border-black/15 text-night"
              aria-label="Fermer le menu"
            >
              <FiX size={19} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
            {MOBILE_LINKS.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMenuOpen(false)}
                className="letter-in group flex items-baseline gap-4 border-b border-black/10 py-4"
                style={{ animationDelay: `${100 + i * 90}ms` }}
              >
                <span className="font-mono text-[10px] text-night/40">{l.index}</span>
                <span className="font-display text-3xl font-black uppercase tracking-tight text-night transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl">
                  {l.label}
                </span>
                <FiArrowUpRight className="ml-auto self-center text-night/40" size={20} />
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center justify-between px-6 pb-8">
            <p className="mono-label text-night/40">
              ULTRA<span className="opacity-50">BARBER</span> — {new Date().getFullYear()}
            </p>
            <BarberPole style={{ '--pole-w': '12px', '--pole-h': '30px' }} />
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="relative overflow-hidden bg-night text-white">
        <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
          <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
            <div className="flex items-center gap-6 md:gap-10">
              <BarberPole
                style={{ '--pole-w': '14px', '--pole-h': '120px' }}
                className="hidden opacity-80 md:block"
              />
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Emblem size={72} className="text-white" />
                <h2 className="font-display font-black uppercase leading-[0.85] tracking-tight text-[clamp(1.8rem,4vw,3.2rem)]">
                  ULTRA
                  <br />
                  <span className="opacity-75">BARBER</span>
                </h2>
              </div>
              <BarberPole
                style={{ '--pole-w': '14px', '--pole-h': '120px' }}
                className="hidden opacity-80 md:block"
              />
            </div>
            <div className="flex flex-col items-start gap-8 md:items-end">
              <p className="mono-label text-white/40">
                Luxury barber studio — réservation en ligne
              </p>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="nav-link text-white/50 hover:text-white">
                  Accueil
                </Link>
                <Link to="/coupes" className="nav-link text-white/50 hover:text-white">
                  Prestations
                </Link>
                <Link to="/reserver" className="nav-link text-white/50 hover:text-white">
                  Réserver
                </Link>
              </nav>
            </div>
          </div>
          <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-6 font-mono text-[10px] uppercase tracking-wide2 text-white/35 sm:flex-row sm:items-center">
            <p>&copy; {new Date().getFullYear()} UltraBarber. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link to="/admin/login" className="transition hover:text-white">
                Espace coiffeur
              </Link>
              <Link to="/assistant/login" className="transition hover:text-white">
                Espace assistant
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
