import React, { createContext, useState, useEffect, useContext } from 'react';

// Cria o contexto
export const AuthContext = createContext();

// Provider que envolve a app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/auth/check', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.loggedIn) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}
