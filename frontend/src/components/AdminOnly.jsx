import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { sendGetProfileRequest } from "../api/user";
import { useState } from "react";
import { AUTH_ROLE_ADMIN } from "../api/auth";

export default function AdminOnly({ children }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState();

  useEffect(() => {
    void (async () => {
      if (user) {
        try {
          const profile = await sendGetProfileRequest(user);
          setProfile(profile);
        } catch {
          logout();
        }
      }
    })();
  }, [user, logout]);

  if (!user) {
    return <Navigate to="/login" />;
  }
  if (!profile) {
    return <h2>Loading</h2>;
  }

  if (profile.role !== AUTH_ROLE_ADMIN) {
    return <Navigate to="/" />;
  }
  return children;
}
