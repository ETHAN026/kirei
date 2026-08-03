import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/public/Home';
import Catalogue from './pages/public/Catalogue';
import Reserver from './pages/public/Reserver';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import RendezVousAdmin from './pages/admin/RendezVousAdmin';
import CoupesAdmin from './pages/admin/CoupesAdmin';
import ClientsAdmin from './pages/admin/ClientsAdmin';
import RapportsAdmin from './pages/admin/RapportsAdmin';
import ParametresAdmin from './pages/admin/ParametresAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="clients" element={<ClientsAdmin />} />
            <Route path="rapports" element={<RapportsAdmin />} />
            <Route path="parametres" element={<ParametresAdmin />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
