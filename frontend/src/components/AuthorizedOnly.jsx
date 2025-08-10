import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { sendGetProfileRequest } from "../api/user";

export default function AuthorizedOnly({ children }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      sendGetProfileRequest(user).catch(() => logout());
    }
  }, [user, logout]);

  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}
