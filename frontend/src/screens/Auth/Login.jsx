import { Link } from "react-router";
import "./Auth.css";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router";
import { useState } from "react";
import { sendLoginRequest } from "../../api/auth";
import PrimaryButton from "../../components/PrimaryButton";
import InputField from "../../components/InputField";
import { useEffect } from "react";

function Login() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Login";
  }, []);

  const handleLogin = async (data) => {
    setError("");
    const username = data.get("username");
    const password = data.get("password");

    try {
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
        <h2 className="auth-title">Login</h2>
        {error !== "" && <p className="error-color">{error}</p>}
        <form className="auth-form" action={handleLogin}>
          <InputField type="text" name="username" placeholder="Username" />
          <InputField type="password" name="password" placeholder="Password" />
          <PrimaryButton type="submit">Login</PrimaryButton>
        </form>
        <p className="login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
