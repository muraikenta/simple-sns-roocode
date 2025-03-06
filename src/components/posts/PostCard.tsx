import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import DeletePostButton from "@/components/posts/DeletePostButton";
import UserAvatar from "@/components/users/UserAvatar";

export interface PostData {
  id: string;
  created_at: string;
  updated_at?: string;
  title: string;
  content: string;
  user_id: string;
  username?: string;
  avatar_url?: string | null;
}

interface PostCardProps {
  post: PostData;
  currentUserId?: string | null;
  onEdit?: (post: PostData) => void;
  onDeleteSuccess?: () => void;
  showAuthor?: boolean;
}

const PostCard = ({
  post,
  currentUserId,
  onEdit,
  onDeleteSuccess,
  showAuthor = true,
}: PostCardProps) => {
  const navigate = useNavigate();
  const isOwnPost = currentUserId === post.user_id;

  const handleUserClick = () => {
    navigate(`/users/${post.user_id}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{post.title}</CardTitle>
          {isOwnPost && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(post)}
                >
                  <Edit size={16} />
                </Button>
              )}
              <DeletePostButton
                postId={post.id}
                onSuccess={onDeleteSuccess}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="py-2 text-xs text-muted-foreground flex justify-between items-center">
        {showAuthor && post.username && (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            onClick={handleUserClick}
          >
            <UserAvatar
              username={post.username}
              avatarUrl={post.avatar_url}
              size="sm"
            />
            <span>投稿者: {post.username}</span>
          </div>
        )}
        <div>
          {post.updated_at && post.updated_at !== post.created_at ? (
            <span>更新日時: {new Date(post.updated_at).toLocaleString()}</span>
          ) : (
            <span>投稿日時: {new Date(post.created_at).toLocaleString()}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;