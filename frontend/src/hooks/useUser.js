import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('movieAppUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (newUsername) => {
    if (!newUsername.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }
    const cleanUsername = newUsername.trim().toLowerCase();
    setUsername(cleanUsername);
    setIsLoggedIn(true);
    localStorage.setItem('movieAppUsername', cleanUsername);
  };

  const logout = () => {
    setUsername('');
    setIsLoggedIn(false);
    localStorage.removeItem('movieAppUsername');
  };

  const value = {
    username,
    isLoggedIn,
    login,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};