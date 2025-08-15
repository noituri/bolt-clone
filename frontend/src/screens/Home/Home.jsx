import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import ClientHome from "./Client/ClientHome";
import Navbar from "../../components/Navbar";
import { sendGetProfileRequest } from "../../api/user";
import { useState } from "react";
import {
  AUTH_ROLE_ADMIN,
  AUTH_ROLE_CLIENT,
  AUTH_ROLE_DRIVER,
} from "../../api/auth";
import AdminHome from "./Admin/AdminHome";

function Home() {
  const { user } = useAuth();
  const [profile, setProfile] = useState();

  useEffect(() => {
    document.title = "Home";
    sendGetProfileRequest(user).then(setProfile);
  }, [user]);

  let homeComponent = <h2>Loading...</h2>;
  if (profile) {
    if (profile.role === AUTH_ROLE_CLIENT) {
      homeComponent = <ClientHome />;
    } else if (profile.role === AUTH_ROLE_ADMIN) {
      homeComponent = <AdminHome />;
    } else if (profile.role === AUTH_ROLE_DRIVER) {
      homeComponent = <h2>Unimplemented driver home</h2>;
    } else {
      homeComponent = <h2>Unkown user role</h2>;
    }
  }

  return (
    <>
      <Navbar active="Home" />
      {homeComponent}
    </>
  );
}

export default Home;
