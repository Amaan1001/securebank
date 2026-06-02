'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  token: string;
}

interface UserContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('sb_auth');
    if (stored) setUserState(JSON.parse(stored));
  }, []);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) sessionStorage.setItem('sb_auth', JSON.stringify(u));
    else sessionStorage.removeItem('sb_auth');
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used inside UserProvider');
  return ctx;
}
