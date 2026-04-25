import { Navigate } from "react-router-dom";

const JoinPage = () => {
  return <Navigate to="/login?mode=signup" replace />;
};

export default JoinPage;
