import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { sendGetProfileRequest } from "../api/user";
import { useState } from "react";
import { useLocation } from "react-router";

export default function AuthorizedOnly({ children }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState();
  const { pathname } = useLocation();

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
  if ((!profile.full_name || !profile.phone) && pathname != "/profile") {
    return <Navigate to="/profile" />;
  }
  return children;
}
