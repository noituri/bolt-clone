import { Link } from "react-router";
import "./Auth.css";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router";
import { useState, useEffect } from "react";
import {
  AUTH_ROLE_CLIENT,
  sendLoginRequest,
  sendRegisterRequest,
} from "../../api/auth";
import PrimaryButton from "../../components/PrimaryButton";
import InputField from "../../components/InputField";

function Register() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Register";
  }, []);

  const handleRegister = async (data) => {
    setError("");
    const username = data.get("username");
    const password = data.get("password");
    const confirmPassword = data.get("confirm-password");


    if (username.length > 50) {
      setError("Username can't be longer than 50 characters");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords are not the same");
      return;
    }
    if (password.length > 50) {
      setError("Password can't be longer than 50 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
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
            <InputField type="text" name="username" placeholder="Username" />
            <InputField type="password" name="password" placeholder="Password" />
            <InputField
                type="password"
                name="confirm-password"
                placeholder="Confirm password"
            />
            <PrimaryButton type="submit">Register</PrimaryButton>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
  );
}

export default Register;
