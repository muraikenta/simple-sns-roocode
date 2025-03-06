import { useState, useRef } from "react";
import { Button } from "./button";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";
import { Upload, Loader2 } from "lucide-react";
import RepositoryFactory from "@/repositories/factory";

interface ImageUploadProps {
  initialImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  userId: string;
}

export const ImageUpload = ({
  initialImageUrl,
  onImageUploaded,
  userId,
}: ImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useErrorDialog();

  const storageRepository = RepositoryFactory.getStorageRepository();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("画像を選択してください");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // リポジトリを使用してファイルをアップロード
      await storageRepository.uploadFile("avatars", filePath, file);

      // 公開URLを取得
      const publicUrl = storageRepository.getFileUrl("avatars", filePath);

      setImageUrl(publicUrl);
      onImageUploaded(publicUrl);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "画像のアップロードに失敗しました";
      showError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32 overflow-hidden rounded-full bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="プロフィール画像"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            No Image
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={uploading}
        className="flex items-center gap-1"
      >
        <Upload size={16} />
        <span>{uploading ? "アップロード中..." : "画像を変更"}</span>
      </Button>
    </div>
  );
};
