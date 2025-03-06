import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserAvatar from "@/components/users/UserAvatar";

interface UserProfileCardProps {
  username: string;
  avatarUrl: string | null;
  bio?: string | null;
}

const UserProfileCard = ({
  username,
  avatarUrl,
  bio,
}: UserProfileCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <UserAvatar username={username} avatarUrl={avatarUrl} size="lg" />
          <div>
            <CardTitle className="text-2xl">{username}</CardTitle>
            {bio && <p className="text-muted-foreground mt-1">{bio}</p>}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default UserProfileCard;