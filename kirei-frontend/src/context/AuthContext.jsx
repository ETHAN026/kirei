import { createContext, useContext, useEffect, useState } from 'react';
import * as adminApi from '../api/admin';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kirei_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .getMe()
      .then(setAdmin)
      .catch(() => localStorage.removeItem('kirei_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    const { token, admin } = await adminApi.login(email, password);
    localStorage.setItem('kirei_admin_token', token);
    setAdmin(admin);
    return admin;
  }

  function signOut() {
    localStorage.removeItem('kirei_admin_token');
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
