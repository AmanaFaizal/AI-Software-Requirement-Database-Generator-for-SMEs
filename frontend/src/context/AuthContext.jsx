import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bizguide_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bizguide_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bizguide_user');
    }
  }, [user]);

  async function login(email, password) {
    const { token, user: u } = await loginUser({ email, password });
    localStorage.setItem('bizguide_token', token);
    setUser(u);
    return u;
  }

  async function register(name, email, password) {
    const { token, user: u } = await registerUser({ name, email, password });
    localStorage.setItem('bizguide_token', token);
    setUser(u);
    return u;
  }

  function logout() {
    localStorage.removeItem('bizguide_token');
    localStorage.removeItem('bizguide_user');
    localStorage.removeItem('bizguide_active_business');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
