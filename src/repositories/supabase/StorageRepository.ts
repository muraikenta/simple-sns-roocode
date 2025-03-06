import { supabase } from "@/lib/supabase";
import { IStorageRepository } from "@/repositories/interfaces";

export class SupabaseStorageRepository implements IStorageRepository {
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        throw new Error(`ファイルのアップロードに失敗しました: ${uploadError.message}`);
      }

      return path;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      
      if (error) {
        throw new Error(`ファイルの削除に失敗しました: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }
}