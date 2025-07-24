import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function AuthorizedOnly({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
