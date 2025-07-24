import { Link } from "react-router";
import "./Auth.css";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router";
import { useState } from "react";
import { sendLoginRequest } from "../../api/auth";

function Login() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async (data) => {
    setError("");
    const username = data.get("username");
    const password = data.get("password");

    try {
      const response = await sendLoginRequest(username, password);
      console.log("resp", response);
      await login(response);
    } catch (e) {
      console.log("err", e);
      setError(e.message);
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        {error !== "" && <p className="error-color">{error}</p>}
        <form className="auth-form" action={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="auth-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
          />
          <button type="submit" className="auth-button">
            Login
          </button>
        </form>
        <p className="login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
