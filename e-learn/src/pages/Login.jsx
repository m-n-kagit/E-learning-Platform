import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios"
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });


useEffect(() => {

  // const timer = setTimeout(() => {

    if(!form.email) return;

    axios.post('http://localhost:4500/vali_api/validate-email', {
      email: form.email
    })
    .then(res => console.log(res.data))
    .catch(err => console.log(err));

  }, 500); // wait 500ms

  return () => clearTimeout(timer);

}, [form.email]);

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
            className="form-input" type="email"
            value={form.email} placeholder="you@email.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input" type="password"
            value={form.password} placeholder="••••••••"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="forgot">Forgot password?</div>

        <button className="btn-primary" style={{ width: "100%" }} onClick={() => navigate("/")}>
          Sign In
        </button>

        <div className="divider">or continue with</div>

        <div className="social-row">
          <button className="btn-ghost"> Google</button>
          <button className="btn-ghost"> GitHub</button>
        </div>
      </div>
    </div>
  );
}
