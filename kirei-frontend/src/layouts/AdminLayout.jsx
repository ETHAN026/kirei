import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { FiLogOut, FiGrid, FiCalendar, FiScissors, FiUsers, FiUser, FiBarChart2, FiSettings } from 'react-icons/fi';

const links = [
  { to: '/admin', label: 'Tableau de bord', end: true, icon: <FiGrid size={15} /> },
  { to: '/admin/rendez-vous', label: 'Rendez-vous', icon: <FiCalendar size={15} /> },
  { to: '/admin/coupes', label: 'Coupes', icon: <FiScissors size={15} /> },
  { to: '/admin/assistants', label: 'Assistants', icon: <FiUsers size={15} /> },
  { to: '/admin/clients', label: 'Clients', icon: <FiUser size={15} /> },
  { to: '/admin/rapports', label: 'Rapports', icon: <FiBarChart2 size={15} /> },
  { to: '/admin/parametres', label: 'Paramètres', icon: <FiSettings size={15} /> },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-cream text-night' : 'text-white/45 hover:bg-white/5 hover:text-white'
  }`;

export default function AdminLayout() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-coal">
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-night px-5 py-6">
        <div className="mb-10 px-1">
          <Logo dark={false} small />
          <p className="mono-label mt-4 text-white/30">Espace coiffeur — No°01</p>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l, i) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              <span className="font-mono text-[9px] text-current opacity-50">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1">{l.label}</span>
              {l.icon}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="truncate px-1 font-mono text-[10px] text-white/40">{admin?.email}</p>
          <button
            onClick={handleSignOut}
            className="mt-2 flex w-full items-center gap-2 px-1 py-2 text-sm text-clay-500 transition hover:text-clay-500/80"
          >
            <FiLogOut size={15} /> Se déconnecter
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="page-enter mx-auto max-w-6xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}