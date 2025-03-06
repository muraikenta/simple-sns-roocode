import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, UserCog, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PageHeaderProps {
  title?: string;
  showBackButton?: boolean;
  user?: User | null;
  showProfileButton?: boolean;
}

const PageHeader = ({
  title,
  showBackButton = false,
  user,
  showProfileButton = true,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span>戻る</span>
          </Button>
        )}
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.user_metadata?.username || user.email}
          </span>
          {showProfileButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile/edit")}
              className="flex items-center gap-1"
            >
              <UserCog size={16} />
              <span>プロフィール編集</span>
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut size={16} />
            <span>ログアウト</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;