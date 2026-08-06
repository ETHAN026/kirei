import { Navigate } from 'react-router-dom';
import { useAssistantAuth } from '../context/AssistantAuthContext';
import Loader from './Loader';

export default function RequireAssistantAuth({ children }) {
  const { assistant, loading } = useAssistantAuth();

  if (loading) return <Loader label="Vérification de la session…" />;
  if (!assistant) return <Navigate to="/assistant/login" replace />;

  return children;
}
