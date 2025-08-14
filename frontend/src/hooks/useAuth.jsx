import { createContext, useCallback, useContext } from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import useSessionStorage from "./useSessionStorage";
import { sendGetProfileRequest } from "../api/user";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useSessionStorage("user", null);
  const navigate = useNavigate();

  const login = useCallback(
    async (data) => {
      const profile = await sendGetProfileRequest(data);
      setUser({
        profile,
        token: data.token,
      });
      await navigate("/");
    },
    [navigate, setUser],
  );

  const logout = useCallback(async () => {
    setUser(null);
    await navigate("/", { replace: true });
  }, [setUser, navigate]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
