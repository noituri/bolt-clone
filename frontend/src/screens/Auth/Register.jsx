import { Link } from "react-router";
import "./Auth.css";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router";
import { useState } from "react";
import {
  AUTH_ROLE_CLIENT,
  sendLoginRequest,
  sendRegisterRequest,
} from "../../api/auth";

function Register() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");

  const handleRegister = async (data) => {
    setError("");
    const username = data.get("username");
    const password = data.get("password");
    const confirmPassword = data.get("confirm-password");

    if (username.length > 50) {
      setError("Username can't be longer than 50 characters");
    }
    if (username.length < 5) {
      setError("Username can't be shorter than 5 characters");
    }
    if (password !== confirmPassword) {
      setError("Passwords are not the same");
    }
    if (password.length > 50) {
      setError("Passwords can't be longer than 50 characters");
    }
    if (password.length < 5) {
      setError("Passwords can't be shorter than 5 characters");
    }

    try {
      await sendRegisterRequest(username, password, AUTH_ROLE_CLIENT);
      const response = await sendLoginRequest(username, password);
      await login(response);
    } catch (e) {
      setError(e.message);
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>
        {error !== "" && <p className="error-color">{error}</p>}
        <form className="auth-form" action={handleRegister}>
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
          <input
            type="password"
            name="confirm-password"
            placeholder="Confirm password"
            className="auth-input"
          />
          <button type="submit" className="auth-button">
            Register
          </button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
