import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthReady } from "@/hooks/use-auth-ready";

interface Props {
  children: React.ReactNode;
}

/** Wrap any page that requires a signed-in user. Redirects to /login when not authenticated. */
const RequireAuth = ({ children }: Props) => {
  const { user, isReady } = useAuthReady();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
