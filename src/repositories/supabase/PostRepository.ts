import { supabase } from "@/lib/supabase";
import { IPostRepository } from "@/repositories/interfaces";
import { Post, PostWithUser } from "@/types/models";

export class SupabasePostRepository implements IPostRepository {
  async getAllPosts(): Promise<PostWithUser[]> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, users(username, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        throw new Error(`Failed to fetch posts: ${error.message}`);
      }

      // ネストされたユーザーデータを平坦化
      return (data || []).map((post) => ({
        ...post,
        username: post.users?.username || "不明なユーザー",
        avatar_url: post.users?.avatar_url || null,
      })) as PostWithUser[];
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      throw error;
    }
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user posts:", error);
        throw new Error(`Failed to fetch user posts: ${error.message}`);
      }

      return data as Post[];
    } catch (error) {
      console.error("Error in getPostsByUserId:", error);
      throw error;
    }
  }

  async createPost(postData: Omit<Post, "id" | "created_at" | "updated_at">): Promise<Post> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        throw new Error(`Failed to create post: ${error.message}`);
      }

      return data as Post;
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  }

  async updatePost(postId: string, userId: string, postData: Partial<Post>): Promise<void> {
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          ...postData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .eq("user_id", userId); // RLSポリシーに合わせて、自分の投稿のみ更新可能にする

      if (error) {
        console.error("Error updating post:", error);
        throw new Error(`Failed to update post: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw error;
    }
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", userId); // RLSポリシーに合わせて、自分の投稿のみ削除可能にする

      if (error) {
        console.error("Error deleting post:", error);
        throw new Error(`Failed to delete post: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw error;
    }
  }
}