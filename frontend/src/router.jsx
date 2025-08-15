import { createBrowserRouter, Outlet } from "react-router";
import Home from "./screens/Home/Home";
import Register from "./screens/Auth/Register";
import Login from "./screens/Auth/Login";
import { AuthProvider } from "./hooks/useAuth";
import AuthorizedOnly from "./components/AuthorizedOnly";
import AdminOnly from "./components/AdminOnly";
import RideHistory from "./screens/RideHistory/RideHistory";
import Profile from "./screens/Profile/Profile";
import UserScreen from "./screens/Admin/User/UserScreen";

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
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "ride-history",
        Component: () => (
          <AuthorizedOnly>
            <RideHistory />
          </AuthorizedOnly>
        ),
      },
      {
        path: "profile",
        Component: () => (
          <AuthorizedOnly>
            <Profile />
          </AuthorizedOnly>
        ),
      },
      {
        path: "admin",
        Component: () => (
          <AdminOnly>
            <Outlet />
          </AdminOnly>
        ),
        children: [
          {
            path: "user/:id",
            Component: UserScreen,
          }
        ]
      }
    ],
  },
]);

export default router;
