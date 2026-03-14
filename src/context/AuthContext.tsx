import React, { createContext, useContext, useState, useCallback } from "react";
import { MOCK_USER, User } from "@/mock/data";
import { useNavigate } from "react-router-dom";

export type Persona = "doctor" | "patient" | "hospital";

interface AuthState {
  persona: Persona | null;
  user: User | null;
  login: (persona: Persona, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  persona: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((p: Persona, _email: string, _password: string) => {
    setPersona(p);
    setUser(MOCK_USER[p]);
  }, []);

  const logout = useCallback(() => {
    setPersona(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ persona, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
