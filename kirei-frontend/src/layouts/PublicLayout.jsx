import { Link, NavLink, Outlet } from 'react-router-dom';

const navLink = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? 'text-plum-600' : 'text-ink/60 hover:text-ink'}`;

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-wide text-ink">綺麗</span>
            <span className="font-display text-xl text-plum-600">Kirei</span>
          </Link>
          <nav className="flex items-center gap-8">
            <NavLink to="/" end className={navLink}>Accueil</NavLink>
            <NavLink to="/coupes" className={navLink}>Nos coupes</NavLink>
            <NavLink to="/reserver" className="btn-primary !py-2.5 !px-5">
              Prendre rendez-vous
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink/50">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-display text-lg text-ink/70">Kirei — 綺麗</p>
            <p>&copy; {new Date().getFullYear()} Kirei. Tous droits réservés.</p>
            <Link to="/admin/login" className="hover:text-plum-600">Espace coiffeur</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
