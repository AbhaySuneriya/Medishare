
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        setSession(session);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for email not confirmed error
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address. Check your inbox for a confirmation link.');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
        return { error };
      }

      toast.success('Signed in successfully!');
      return { data };
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return { error };
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Set this to true to skip email verification for now
          // This is only for development, should be removed in production
          data: { email_confirmed: true }
        }
      });

      if (error) {
        toast.error(error.message || 'Failed to sign up');
        return { error };
      }

      // Check if email confirmation is required
      if (data?.user && !data.user.confirmed_at) {
        toast.success('Account created! Please check your email for verification.');
      } else {
        toast.success('Account created successfully!');
      }
      
      return { data };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'An error occurred');
      return { error };
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear state first to prevent UI flicker
      setUser(null);
      setSession(null);
      
      // Then sign out of Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message || 'Failed to sign out');
        return;
      }
      
      toast.success('Signed out successfully!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'An error occurred during sign out');
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
