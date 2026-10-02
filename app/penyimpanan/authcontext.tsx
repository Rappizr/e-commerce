"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  alamat?: string;
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil profil dari Supabase (dukung customer & admin)
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && profile) {
        setUser({
          id: profile.id,
          name: profile.nama || userEmail.split("@")[0],
          email: profile.email || userEmail,
          phone: profile.no_hp || "",
          alamat: profile.alamat || "",
          role: profile.role || "customer",
        });
      } else {
        // Fallback jika baris di profiles belum ada
        const fallbackName = userEmail.split("@")[0] || "Pelanggan";

        await supabase.from("profiles").upsert({
          id: userId,
          email: userEmail,
          nama: fallbackName,
          role: "customer",
        });

        setUser({
          id: userId,
          name: fallbackName,
          email: userEmail,
          role: "customer",
        });
      }
    } catch (err) {
      console.error("Fetch profile error in AuthContext:", err);
      setUser({
        id: userId,
        name: userEmail.split("@")[0],
        email: userEmail,
        role: "customer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          await fetchUserProfile(session.user.id, session.user.email || "");
        } else if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
      } else if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || "");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("almaco_user");
      localStorage.removeItem("almaco_saved_addresses");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const refreshProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserProfile(session.user.id, session.user.email || "");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
