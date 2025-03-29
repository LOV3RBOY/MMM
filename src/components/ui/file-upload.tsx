import { useRef, useState } from "react";
import { Button } from "./button";
import { Progress } from "./progress";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  className?: string;
  defaultImageUrl?: string;
  label?: string;
}

export function FileUpload({
  onUploadComplete,
  className,
  defaultImageUrl,
  label = "Upload Image",
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    defaultImageUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, isUploading, progress, error } = useImageUpload({
    onSuccess: (url) => {
      setPreview(url);
      onUploadComplete(url);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload the file
    await uploadImage(file);

    // Clean up the object URL
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors",
          isUploading && "opacity-70 cursor-not-allowed",
          preview && "border-solid border-blue-200 bg-blue-50",
        )}
        onClick={!isUploading ? handleButtonClick : undefined}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-48 rounded-md"
            />
            {!isUploading && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-black/20"
                  onClick={handleButtonClick}
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            Uploading... {Math.round(progress)}%
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">Error: {error.message}</p>
      )}
    </div>
  );
}
