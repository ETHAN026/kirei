import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/Messages';
import Emblem from '../../components/Emblem';
import BarberPole from '../../components/BarberPole';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="line-texture relative flex min-h-screen items-center justify-center overflow-hidden bg-night px-6">
      <div className="pointer-events-none absolute left-10 top-1/2 hidden -translate-y-1/2 opacity-70 lg:block">
        <BarberPole style={{ '--pole-w': '16px', '--pole-h': '200px' }} />
      </div>
      <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 opacity-70 lg:block">
        <BarberPole style={{ '--pole-w': '16px', '--pole-h': '200px' }} />
      </div>

      <div className="relative w-full max-w-sm border border-white/15 bg-coal p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Emblem size={40} className="text-white" />
            <div>
              <p className="font-display text-lg font-black uppercase leading-none tracking-tight text-white">
                ULTRA<span className="opacity-50">BARBER</span>
              </p>
              <p className="mono-label mt-2 text-white/30">Espace coiffeur</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">E-mail</label>
            <input
              required
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input
              required
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="submit" disabled={loading} className="btn-solid-light w-full">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mono-label mt-6 text-center text-white/25">
          Réservé au personnel — No°01
        </p>
      </div>
    </div>
  );
}