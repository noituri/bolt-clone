import { createBrowserRouter, Outlet } from "react-router";
import Home from "./screens/Home/Home";
import Register from "./screens/Auth/Register";
import Login from "./screens/Auth/Login";
import { AuthProvider } from "./hooks/useAuth";
import AuthorizedOnly from "./components/AuthorizedOnly";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => {
      return (
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      );
    },
    children: [
      {
        index: true,
        Component: () => (
          <AuthorizedOnly>
            <Home />
          </AuthorizedOnly>
        ),
      },
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/register",
        Component: Register,
      },
    ],
  },
]);

export default router;
