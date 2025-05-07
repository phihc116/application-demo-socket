import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = AuthService.getToken();
    setIsAuthenticated(!!token);
  }, []);

  const login = (token: string) => {
    AuthService.setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    AuthService.removeToken();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout
  };
};