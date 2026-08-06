import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/Messages';

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
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-4xl text-ink">綺麗</p>
          <p className="font-display text-xl text-plum-600">Kirei — Espace coiffeur</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
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
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
