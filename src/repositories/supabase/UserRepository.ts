import { supabase } from "@/lib/supabase";
import { IUserRepository } from "@/repositories/interfaces";
import { User } from "@/types/models";

export class SupabaseUserRepository implements IUserRepository {
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error("Error in getUserById:", error);
      return null;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user:", error);
        throw new Error(`Failed to update user: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }
}
