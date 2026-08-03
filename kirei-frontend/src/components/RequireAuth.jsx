import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function RequireAuth({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return <Loader label="Vérification de la session…" />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}
