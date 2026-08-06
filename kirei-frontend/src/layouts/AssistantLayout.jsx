import { Outlet, useNavigate } from 'react-router-dom';
import { useAssistantAuth } from '../context/AssistantAuthContext';
import { FiLogOut } from 'react-icons/fi';

export default function AssistantLayout() {
  const { assistant, signOut } = useAssistantAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/assistant/login');
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-display text-2xl text-ink">綺麗 Kirei</p>
            <p className="text-xs uppercase tracking-wide text-ink/40">Espace assistant</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-ink/70">{assistant?.prenom} {assistant?.nom}</p>
            <button onClick={handleSignOut} className="btn-ghost">
              <FiLogOut size={15} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
