import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const UserAvatar = ({
  username,
  avatarUrl,
  size = "md",
  onClick,
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  const fontSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-muted flex-shrink-0",
        sizeClasses[size],
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${username}のプロフィール画像`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center text-muted-foreground",
            fontSizeClasses[size]
          )}
        >
          No Img
        </div>
      )}
    </div>
  );
};

export default UserAvatar;