import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import validator from "./user_validator.js";
import pass_word_verify from "./pass_validator.js";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {

    const timer = setTimeout(() => {

      if (!form.email) {
        setEmailError("");
        return;
      }

      const isValid = validator(form.email);

      if (!isValid) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }

    }, 500);

    return () => clearTimeout(timer);

  }, [form.email]);

  useEffect(() => {

    const timer = setTimeout(() => {

      if (!form.password) {
        setPassError("");
        return;
      }

      const isValid = pass_word_verify(form.password);

      if (!isValid) {
        setPassError("Invalid password format\n Password must contain atleast 8 characters\nPassword must contain atleast one lower case letter\nPassword must contain atleast one upper case letter\nPassword must contain atleast one digit\n Password must contain atleast one special character (!@#$%^&*)");
      } else {
        setPassError("");
      }

    }, 500);

    return () => clearTimeout(timer);

  }, [form.password]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🎓</div>

        <h1 className="auth-title">Welcome back</h1>

        <p className="auth-sub">
          No account?{" "}
          <Link to="/signup" className="auth-link">Sign up free</Link>
        </p>

        <div className="form-group">
          <label className="form-label">Email</label>

          <input
            className="form-input"
            type="email"
            value={form.email}
            placeholder="you@email.com"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {emailError && (
            <p style={{ color: "red", fontSize: "14px" }}>
              {emailError}
            </p>
          )}

        </div>

        <div className="form-group">
          <label className="form-label">Password</label>

          <input
            className="form-input"
            type="password"
            value={form.password}
            placeholder="••••••••"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            />
            {passError && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {passError}
              </p>
            )}
        </div>

        <div className="forgot">Forgot password?</div>

        <button
          className="btn-primary"
          style={{ width: "100%" }}
          onClick={() => navigate("/")}
        >
          Sign In
        </button>

        <div className="divider">or continue with</div>

        <div className="social-row">
          <button className="btn-ghost">Google</button>
          <button className="btn-ghost">GitHub</button>
        </div>
      </div>
    </div>
  );
}