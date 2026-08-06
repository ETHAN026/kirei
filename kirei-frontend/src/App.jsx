import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AssistantAuthProvider } from './context/AssistantAuthContext';
import RequireAuth from './components/RequireAuth';
import RequireAssistantAuth from './components/RequireAssistantAuth';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import AssistantLayout from './layouts/AssistantLayout';

import Home from './pages/public/Home';
import Catalogue from './pages/public/Catalogue';
import Reserver from './pages/public/Reserver';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import RendezVousAdmin from './pages/admin/RendezVousAdmin';
import CoupesAdmin from './pages/admin/CoupesAdmin';
import AssistantsAdmin from './pages/admin/AssistantsAdmin';
import ClientsAdmin from './pages/admin/ClientsAdmin';
import RapportsAdmin from './pages/admin/RapportsAdmin';
import ParametresAdmin from './pages/admin/ParametresAdmin';

import AssistantLogin from './pages/assistant/AssistantLogin';
import AssistantRendezVous from './pages/assistant/AssistantRendezVous';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AssistantAuthProvider>
          <Routes>
            {/* Front-office client */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/coupes" element={<Catalogue />} />
              <Route path="/reserver" element={<Reserver />} />
            </Route>

            {/* Auth admin */}
            <Route path="/admin/login" element={<Login />} />

            {/* Back-office coiffeur (protégé) */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="rendez-vous" element={<RendezVousAdmin />} />
              <Route path="coupes" element={<CoupesAdmin />} />
              <Route path="assistants" element={<AssistantsAdmin />} />
              <Route path="clients" element={<ClientsAdmin />} />
              <Route path="rapports" element={<RapportsAdmin />} />
              <Route path="parametres" element={<ParametresAdmin />} />
            </Route>

            {/* Auth assistant */}
            <Route path="/assistant/login" element={<AssistantLogin />} />

            {/* Espace assistant (protégé, distinct de l'admin) */}
            <Route
              path="/assistant"
              element={
                <RequireAssistantAuth>
                  <AssistantLayout />
                </RequireAssistantAuth>
              }
            >
              <Route index element={<AssistantRendezVous />} />
            </Route>
          </Routes>
        </AssistantAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
