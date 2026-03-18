import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  token: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({ 
        session, 
        user: session?.user ?? null, 
        token: session?.access_token ?? null,
        loading: false 
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        set({ 
          session, 
          user: session?.user ?? null, 
          token: session?.access_token ?? null,
          loading: false 
        });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },
}));
