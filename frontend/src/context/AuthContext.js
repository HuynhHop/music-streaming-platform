import React, { createContext, useState, useEffect } from 'react';
const ETypeRole = require("../enums/ETypeRole");

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    role: null,
    accessToken: null,
  });

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUser = JSON.parse(localStorage.getItem('userdata'));
    const storedRole = localStorage.getItem('role');

    if (storedAccessToken && storedUser && storedRole) {
      const role = isNaN(storedRole) ? storedRole : Number(storedRole);
      setAuthState({
        isAuthenticated: true,
        user: storedUser,
        role: role,
        accessToken: storedAccessToken,
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
        accessToken: null,
      });
    }
  }, []);  // Effect chạy 1 lần khi component được mount

  const login = (user, role, accessToken) => {
    setAuthState({
      isAuthenticated: true,
      user,
      role,
      accessToken,
    });
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userdata', JSON.stringify(user));
    localStorage.setItem('role', role);  // Lưu role vào localStorage dưới dạng number hoặc string
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
      accessToken: null,
    });
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
