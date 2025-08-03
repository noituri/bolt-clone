import { useEffect } from "react";
// import { useAuth } from "../../hooks/useAuth";
import ClientHome from "./Client/ClientHome";
import Navbar from "../../components/Navbar";

function Home() {
  // TODO: Depending on user role choose different `*Home`
  // const { user, login } = useAuth();

  useEffect(() => {
    document.title = "Home";
  }, []);

  return (
    <>
      <Navbar active="Home" />
      <ClientHome />
    </>
  );
}

export default Home;
