import { Link } from "react-router";
import "./Navbar.css";
import { useAuth } from "../hooks/useAuth";

function Navbar({ active }) {
  const { logout } = useAuth();

  return (
    <nav className="primary-navbar">
      <ul>
        <li className={active === "Home" && "active"}>
          <Link to="/">Home</Link>
        </li>
      </ul>
      <ul>
        <li className={active === "Profile" && "active"}>
          <Link to="/profile">Profile</Link>
        </li>
        <li className={active === "Ride History" && "active"}>
          <Link to="/ride-history">Ride History</Link>
        </li>
        <li onClick={logout}>Logout</li>
      </ul>
    </nav>
  );
}

export default Navbar;
