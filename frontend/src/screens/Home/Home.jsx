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

function Home() {
  const { user } = useAuth();
  const [profile, setProfile] = useState();

  useEffect(() => {
    document.title = "Home";
    sendGetProfileRequest(user).then(setProfile);
  }, [user]);

  let homeComponent = <h1>Loading...</h1>;
  if (profile) {
    if (profile.role === AUTH_ROLE_CLIENT) {
      homeComponent = <ClientHome />;
    } else if (profile.role === AUTH_ROLE_ADMIN) {
      homeComponent = <h1>Unimplemented admin home</h1>;
    } else if (profile.role === AUTH_ROLE_DRIVER) {
      homeComponent = <h1>Unimplemented driver home</h1>;
    } else {
      homeComponent = <h1>Unkown user role</h1>;
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
