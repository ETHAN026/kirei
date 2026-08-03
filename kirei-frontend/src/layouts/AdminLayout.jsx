import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/rendez-vous', label: 'Rendez-vous' },
  { to: '/admin/coupes', label: 'Coupes' },
  { to: '/admin/clients', label: 'Clients' },
  { to: '/admin/rapports', label: 'Rapports' },
  { to: '/admin/parametres', label: 'Paramètres du salon' },
];

const linkClass = ({ isActive }) =>
  `block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-plum-600 text-white' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
  }`;

export default function AdminLayout() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/admin/login');
  }

 return (
  /* 1. On fixe la hauteur à la taille exacte de l'écran (h-screen + overflow-hidden) */
  <div className="flex h-screen overflow-hidden bg-paper">
    
    {/* 2. L'aside reste fixe sans défilement général */}
    <aside className="flex w-64 shrink-0 flex-col border-r border-ink/10 bg-white px-4 py-6">
      <div className="mb-8 px-2">
        <p className="font-display text-2xl text-ink">綺麗 Kirei</p>
        <p className="text-xs uppercase tracking-wide text-ink/40">Espace coiffeur</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink/10 pt-4">
        <p className="truncate px-2 text-sm text-ink/70">{admin?.email}</p>
        <button onClick={handleSignOut} className="btn-ghost mt-2 w-full justify-start">
          Se déconnecter
        </button>
      </div>
    </aside>

    {/* 3. Seul le contenu principal prend la hauteur restante et défile */}
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Outlet />
      </div>
    </main>
  </div>
);
}
