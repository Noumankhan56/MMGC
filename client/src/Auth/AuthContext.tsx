import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authApi from "./api";

// ── Types ──
export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: "Admin" | "Doctor" | "Patient";
  profilePictureUrl?: string;
  isEmailVerified: boolean;
  doctorProfileId?: number;
  patientProfileId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string, role?: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// ── Provider ──
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mmgc_user");
    const token = localStorage.getItem("mmgc_access_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("mmgc_user");
      }
    }
    setIsLoading(false);
  }, []);

  const persistAuth = (data: {
    accessToken: string;
    refreshToken: string;
    userId: number;
    name: string;
    email: string;
    role: string;
    profilePictureUrl?: string;
    isEmailVerified: boolean;
    doctorProfileId?: number;
    patientProfileId?: number;
  }) => {
    localStorage.setItem("mmgc_access_token", data.accessToken);
    localStorage.setItem("mmgc_refresh_token", data.refreshToken);
    const u: AuthUser = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role as AuthUser["role"],
      profilePictureUrl: data.profilePictureUrl,
      isEmailVerified: data.isEmailVerified,
      doctorProfileId: data.doctorProfileId,
      patientProfileId: data.patientProfileId,
    };
    localStorage.setItem("mmgc_user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const { data } = await authApi.post("/auth/login", { email, password });
    persistAuth(data);
  };

  const googleLogin = async (credential: string, role?: string) => {
    const { data } = await authApi.post("/auth/google", { credential, role: role || "Patient" });
    persistAuth(data);
  };

  const register = async (payload: Record<string, unknown>) => {
    const { data } = await authApi.post("/auth/register", payload);
    persistAuth(data);
  };

  const logout = useCallback(async () => {
    try {
      await authApi.post("/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("mmgc_access_token");
    localStorage.removeItem("mmgc_refresh_token");
    localStorage.removeItem("mmgc_user");
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const { data } = await authApi.get("/auth/me");
      const u: AuthUser = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        profilePictureUrl: data.profilePictureUrl,
        isEmailVerified: data.isEmailVerified,
        doctorProfileId: data.doctorProfileId,
        patientProfileId: data.patientProfileId,
      };
      localStorage.setItem("mmgc_user", JSON.stringify(u));
      setUser(u);
    } catch {
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        googleLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
