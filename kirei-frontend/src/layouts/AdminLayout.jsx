import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { FiLogOut, FiGrid, FiCalendar, FiScissors, FiUsers, FiUser, FiBarChart2, FiSettings, FiMenu, FiX } from 'react-icons/fi';

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
  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-cream text-night' : 'text-white/45 hover:bg-white/5 hover:text-white'
  }`;

export default function AdminLayout() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleSignOut() {
    signOut();
    navigate('/admin/login');
  }

  function handleNavClick() {
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-coal">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-night px-4 py-3 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white">
          <FiMenu size={22} />
        </button>
        <Logo dark={false} small />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-white/10 bg-night px-5 py-6 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 flex items-start justify-between px-1">
          <div>
            <Logo dark={false} small />
            <p className="mono-label mt-4 text-white/30">Espace coiffeur — No°01</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="mt-1 text-white/40 hover:text-white lg:hidden">
            <FiX size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l, i) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={handleNavClick}>
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

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="page-enter mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
