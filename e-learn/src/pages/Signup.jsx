import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });


  
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🚀</div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-sub">
          Already have one?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            value={form.name} placeholder="John Doe"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input" type="email"
            value={form.email} placeholder="you@email.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input" type="password"
            value={form.password} placeholder="Min. 8 characters"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <p className="terms">
          By signing up you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.
        </p>

        <button className="btn-primary" style={{ width: "100%" }} onClick={() => navigate("/")}>
          Create Account
        </button>

        <div className="divider">or sign up with</div>

        <div className="social-row">
          <button className="btn-ghost">🔵 Google</button>
          <button className="btn-ghost">⬛ GitHub</button>
        </div>
      </div>
    </div>
  );
}
