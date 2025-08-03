import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../api/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }
    setLoading(false);
  }, []);

  const register = async (formData) => {
    try {
      const user = await authService.register(formData);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Registration successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const login = async (formData) => {
    try {
      const user = await authService.login(formData);
      setUser(user);
      toast.success('Login successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const getProfile = async () => {
    if (!user) return null;
    try {
      const profile = await authService.getProfile(user.token);
      return profile;
    } catch (error) {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);