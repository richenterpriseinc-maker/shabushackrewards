import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthReady } from "@/hooks/use-auth-ready";

const JoinPage = () => {
  const navigate = useNavigate();
  const { user, isReady } = useAuthReady();

  useEffect(() => {
    if (isReady) {
      navigate(user ? "/rewards" : "/login", { replace: true });
    }
  }, [isReady, user, navigate]);

  return null;
};

export default JoinPage;
