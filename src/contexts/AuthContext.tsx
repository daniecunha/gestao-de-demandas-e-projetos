import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { UserRole } from '../services/usersService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAuthorized: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL as string | undefined;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [role, setRole]               = useState<UserRole | null>(null);
  const [isAuthorized, setAuthorized] = useState(false);
  const [loading, setLoading]         = useState(true);

  async function resolveProfile(u: User | null) {
    if (!u) {
      setUser(null);
      setRole(null);
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setUser(u);
    const email = u.email ?? '';
    const isSuperAdmin = !!ALLOWED_EMAIL && email === ALLOWED_EMAIL;

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        setRole(profile.role as UserRole);
        setAuthorized(true);
      } else if (isSuperAdmin) {
        // Primeiro login do proprietário: auto-cria perfil admin
        await supabase.from('user_profiles').upsert(
          { email, nome: (u.user_metadata?.full_name as string) ?? '', role: 'admin' },
          { onConflict: 'email' }
        );
        setRole('admin');
        setAuthorized(true);
      } else {
        setRole(null);
        setAuthorized(false);
      }
    } catch {
      // Se a tabela não existir ainda, permite superadmin pelo email
      if (isSuperAdmin) {
        setRole('admin');
        setAuthorized(true);
      } else {
        setRole(null);
        setAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveProfile(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, isAuthorized, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
