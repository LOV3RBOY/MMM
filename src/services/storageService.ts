import { supabase } from "../../supabase/supabase";

export const storageService = {
  /**
   * Upload a file to the model-images bucket
   * @param file The file to upload
   * @param path Optional path within the bucket
   * @returns The URL of the uploaded file
   */
  async uploadModelImage(file: File, path?: string): Promise<string> {
    const filePath = path ? `${path}/${file.name}` : file.name;

    const { data, error } = await supabase.storage
      .from("model-images")
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (error) {
      console.error("Error uploading model image:", error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("model-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  /**
   * Upload a document to the model-documents bucket
   * @param file The file to upload
   * @param path Optional path within the bucket
   * @returns The path of the uploaded file
   */
  async uploadModelDocument(file: File, path?: string): Promise<string> {
    const filePath = path ? `${path}/${file.name}` : file.name;

    const { data, error } = await supabase.storage
      .from("model-documents")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      console.error("Error uploading model document:", error);
      throw error;
    }

    return data.path;
  },

  /**
   * Get a temporary URL for a private document
   * @param path The path of the file in the model-documents bucket
   * @returns A temporary URL that can be used to access the file
   */
  async getModelDocumentUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("model-documents")
      .createSignedUrl(path, 60 * 60); // 1 hour expiry

    if (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }

    return data.signedUrl;
  },

  /**
   * Delete a file from a bucket
   * @param bucket The bucket name ("model-images" or "model-documents")
   * @param path The path of the file to delete
   */
  async deleteFile(
    bucket: "model-images" | "model-documents",
    path: string,
  ): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error(`Error deleting file from ${bucket}:`, error);
      throw error;
    }
  },
};
