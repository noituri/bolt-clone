import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import ClientHome from "./Client/ClientHome";

function Home() {
  // TODO: Depending on user role choose different `*Home`
  const { user, login } = useAuth();

  useEffect(() => {
    document.title = "Register";
  }, []);

  return <ClientHome />;
}

export default Home;
