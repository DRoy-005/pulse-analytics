"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
  type AuthUser,
  type AuthWorkspace,
} from "@/lib/api";

// ============================================================
// Auth context types
// ============================================================

interface AuthContextType {
  user: AuthUser | null;
  workspace: AuthWorkspace | null;
  token: string | null;

  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}

// ============================================================
// Create context
// ============================================================

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

// ============================================================
// Auth Provider
// ============================================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [workspace, setWorkspace] =
    useState<AuthWorkspace | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ----------------------------------------------------------
  // Restore existing login when the app starts
  // ----------------------------------------------------------

  useEffect(() => {
    async function restoreSession() {
      const storedToken =
        localStorage.getItem(
          "pulse_auth_token"
        );

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await getCurrentUser(
            storedToken
          );

        if (response.success) {
          setToken(storedToken);
          setUser(response.data.user);
          setWorkspace(
            response.data.workspace
          );
        } else {
          localStorage.removeItem(
            "pulse_auth_token"
          );
        }
      } catch (error) {
        console.error(
          "Failed to restore authentication:",
          error
        );

        localStorage.removeItem(
          "pulse_auth_token"
        );
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------

  async function login(
    email: string,
    password: string
  ) {
    const response =
      await loginUser(
        email,
        password
      );

    if (!response.success) {
      throw new Error(
        response.message ||
          "Login failed."
      );
    }

    const newToken =
      response.data.token;

    // Save token so the session survives
    // page refreshes
    localStorage.setItem(
      "pulse_auth_token",
      newToken
    );

    setToken(newToken);
    setUser(response.data.user);
    setWorkspace(
      response.data.workspace
    );
  }

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------

  function logout() {
    localStorage.removeItem(
      "pulse_auth_token"
    );

    setToken(null);
    setUser(null);
    setWorkspace(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// useAuth hook
// ============================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}