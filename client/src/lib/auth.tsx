"use client";

import { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME_QUERY, LOGIN_MUTATION, REGISTER_MUTATION, LOGOUT_MUTATION } from "./queries";
import { apolloClient } from "./apollo";
import type { User, MeData, LoginData, RegisterData, LogoutData } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, name: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, loading } = useQuery<MeData>(ME_QUERY);
  const [loginMutation] = useMutation<LoginData>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<RegisterData>(REGISTER_MUTATION);
  const [logoutMutation] = useMutation<LogoutData>(LOGOUT_MUTATION);

  const user = data?.me ?? null;

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
        refetchQueries: [{ query: ME_QUERY }],
      });
      if (!data) throw new Error("Login failed");
      return data.login.user;
    },
    [loginMutation]
  );

  const register = useCallback(
    async (email: string, name: string, password: string): Promise<User> => {
      const { data } = await registerMutation({
        variables: { input: { email, name, password } },
        refetchQueries: [{ query: ME_QUERY }],
      });
      if (!data) throw new Error("Registration failed");
      return data.register.user;
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation();
    await apolloClient.resetStore();
  }, [logoutMutation]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
