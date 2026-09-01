import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('localfix_token');
      const cachedUser = localStorage.getItem('localfix_user');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Show cached user immediately for a snappy UI, then verify with the server.
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          // ignore parse errors, fall through to server verification
        }
      }

      try {
        const { data } = await authApi.me();
        setUser(data.user);
        localStorage.setItem('localfix_user', JSON.stringify(data.user));
      } catch {
        localStorage.removeItem('localfix_token');
        localStorage.removeItem('localfix_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('localfix_token', data.token);
    localStorage.setItem('localfix_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('localfix_token', data.token);
    localStorage.setItem('localfix_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout; clear client state regardless
    }
    localStorage.removeItem('localfix_token');
    localStorage.removeItem('localfix_user');
    setUser(null);
  }, []);

  const updateCachedUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('localfix_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateCachedUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export { getErrorMessage };
