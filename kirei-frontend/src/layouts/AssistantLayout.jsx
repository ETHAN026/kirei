import { Outlet, useNavigate } from 'react-router-dom';
import { useAssistantAuth } from '../context/AssistantAuthContext';
import Logo from '../components/Logo';
import { FiLogOut } from 'react-icons/fi';

export default function AssistantLayout() {
  const { assistant, signOut } = useAssistantAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/assistant/login');
  }

  return (
    <div className="min-h-screen bg-coal">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <Logo dark={false} small />
            <p className="mono-label mt-3 text-white/30">Espace assistant — No°02</p>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-mono text-[10px] uppercase tracking-wide2 text-white/60">
              {assistant?.prenom} {assistant?.nom}
            </p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <FiLogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="page-enter mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}