import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface UserContextType {
  username: string;
  isLoggedIn: boolean;
  login: (newUsername: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [username, setUsername] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('movieAppUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (newUsername: string): void => {
    if (!newUsername.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }
    const cleanUsername = newUsername.trim().toLowerCase();
    setUsername(cleanUsername);
    setIsLoggedIn(true);
    localStorage.setItem('movieAppUsername', cleanUsername);
  };

  const logout = (): void => {
    setUsername('');
    setIsLoggedIn(false);
    localStorage.removeItem('movieAppUsername');
  };

  const value: UserContextType = {
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