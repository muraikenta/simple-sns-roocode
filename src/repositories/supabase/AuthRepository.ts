import { supabase } from "@/lib/supabase";
import { IAuthRepository } from "@/repositories/interfaces";
import { User as SupabaseUser } from "@supabase/supabase-js";

export class SupabaseAuthRepository implements IAuthRepository {
  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<SupabaseUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error signing in:", error);
        throw new Error(`Failed to sign in: ${error.message}`);
      }

      return data.user;
    } catch (error) {
      console.error("Error in signIn:", error);
      throw error;
    }
  }

  async signUp(email: string, password: string, username: string): Promise<SupabaseUser | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        console.error("Error signing up:", error);
        throw new Error(`Failed to sign up: ${error.message}`);
      }

      return data.user;
    } catch (error) {
      console.error("Error in signUp:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        throw new Error(`Failed to sign out: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in signOut:", error);
      throw error;
    }
  }

  onAuthStateChange(callback: (user: SupabaseUser | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }
}