import { useState } from "react";
import { storageService } from "@/services/storageService";

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useImageUpload(options?: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImage = async (file: File, path?: string) => {
    if (!file) return;

    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      const url = await storageService.uploadModelImage(file, path);

      clearInterval(progressInterval);
      setProgress(100);
      setImageUrl(url);
      options?.onSuccess?.(url);

      return url;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to upload image");
      setError(error);
      options?.onError?.(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    imageUrl,
    reset: () => {
      setIsUploading(false);
      setProgress(0);
      setError(null);
      setImageUrl(null);
    },
  };
}
