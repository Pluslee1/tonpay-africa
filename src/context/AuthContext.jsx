import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
      setIsAdmin(res.data.user.role === 'admin');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    const res = await axios.post('/api/auth/login', { email: emailOrPhone, phone: emailOrPhone, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
    setUser(res.data.user);
    setIsAdmin(res.data.user.role === 'admin');
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};





