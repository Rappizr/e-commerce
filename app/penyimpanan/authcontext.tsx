'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

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

  // 1. Ambil data profil pelanggan dari Supabase berdasarkan user.id sesi
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        const loadedUser: UserProfile = {
          id: profile.id,
          name: profile.nama || userEmail.split('@')[0],
          email: profile.email || userEmail,
          phone: profile.no_hp || '',
          alamat: profile.alamat || '',
          role: profile.role || 'customer',
        };
        setUser(loadedUser);
      } else {
        // Fallback jika baris di tabel profiles belum sempat terisi
        setUser({
          id: userId,
          name: userEmail.split('@')[0],
          email: userEmail,
        });
      }
    } catch (err) {
      console.error('Fetch profile error in AuthContext:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Cek sesi saat aplikasi pertama kali dimuat & pasang listener real-time
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setIsLoading(false);
      }
    };

    initAuth();

    // Listener otomatis jika status autentikasi berubah di Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Update state user lokal (dipanggil setelah register/login berhasil)
  const login = (userData: UserProfile) => {
    setUser(userData);
  };

  // 4. Logout resmi dari Supabase Auth
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('almaco_user');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 5. Fungsi untuk memperbarui data profil setelah user mengedit profil
  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await fetchUserProfile(session.user.id, session.user.email || '');
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
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}