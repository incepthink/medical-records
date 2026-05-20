import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { login as apiLogin, signup as apiSignup, getMe } from "@/api/auth";
import type { AuthUser as ApiAuthUser } from "@/api/auth";
import {
  apiToUiPersona,
  uiToApiPersona,
  type UIPersona,
} from "@/lib/personaMap";

export type Persona = UIPersona;

export interface AuthUser extends Omit<ApiAuthUser, "persona"> {
  persona: UIPersona;
}

interface AuthContextType {
  persona: UIPersona | null;
  user: AuthUser | null;
  isInitializing: boolean;
  login: (persona: UIPersona, email: string, password: string) => Promise<UIPersona>;
  signup: (
    persona: UIPersona,
    name: string,
    email: string,
    password: string,
    wallet?: string,
  ) => Promise<UIPersona>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toUiUser(apiUser: ApiAuthUser): AuthUser {
  return { ...apiUser, persona: apiToUiPersona(apiUser.persona) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [persona, setPersona] = useState<UIPersona | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsInitializing(false);
      return;
    }
    getMe()
      .then((u) => {
        const ui = toUiUser(u);
        setUser(ui);
        setPersona(ui.persona);
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const login = useCallback(
    async (_p: UIPersona, email: string, password: string): Promise<UIPersona> => {
      const { user: u, token } = await apiLogin(email, password);
      const ui = toUiUser(u);
      localStorage.setItem("token", token);
      queryClient.clear();
      setPersona(ui.persona);
      setUser(ui);
      return ui.persona;
    },
    [queryClient],
  );

  const signup = useCallback(
    async (
      p: UIPersona,
      name: string,
      email: string,
      password: string,
      wallet?: string,
    ): Promise<UIPersona> => {
      const { user: u, token } = await apiSignup(
        name,
        email,
        password,
        uiToApiPersona(p),
        wallet,
      );
      const ui = toUiUser(u);
      localStorage.setItem("token", token);
      queryClient.clear();
      setPersona(ui.persona);
      setUser(ui);
      return ui.persona;
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    queryClient.clear();
    setPersona(null);
    setUser(null);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ persona, user, isInitializing, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
