import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import validator from "./user_validator.js";
import pass_word_verify from "./pass_validator.js";

function Forget_Password() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!location.state?.fromLogin) {
      navigate("/login", { replace: true }); // replace is used to
      // prevent going back to this page using back button
    }
  }, [location.state, navigate]); // this state hook is used to 
  // check if the user came from the login page, 
  // if not then it redirects to login page

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!email) {
        setEmailError("");
        return;
      }

      setEmailError(validator(email) ? "" : "Invalid email format");
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);



  useEffect(() => {
    const timer = setTimeout(() => {
      if (!password) {
        setPasswordError("");
        return;
      }

      setPasswordError(pass_word_verify(password) ? "" : "Invalid password format");
    }, 400);

    return () => clearTimeout(timer);
  }, [password]);

  const handleSendOtp = async () => {
    try {
      setRequestError("");

      if (!email) {
        setRequestError("Please enter your email.");
        return;
      }

      if (!validator(email)) {
        setRequestError("Please enter a valid email address.");
        return;
      }

      setIsSubmitting(true);

      await axios.post(
        "/api/auth/forget-password",
        { email },
        { withCredentials: true }
      );

      navigate("/validate-otp", {
        state: {
          email,
          mode: "reset-password",
        },
      });
    } catch (error) {
      console.error("Error requesting password reset OTP:", error);
      setRequestError(
        error.response?.data?.message || "Unable to send OTP right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Forgot your password?</h1>
        <p className="auth-sub">
          Enter your email and we&apos;ll send you an OTP to reset your password.
        </p>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            placeholder="you@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && (
            <p style={{ color: "red", fontSize: "14px" }}>
              {emailError}
            </p>
          )}
        </div>

        {requestError && (
          <p style={{ color: "red", fontSize: "14px" }}>
            {requestError}
          </p>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%" }}
          onClick={handleSendOtp}
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? "Sending OTP..." : "Send OTP"}
        </button>

        <div className="divider">or</div>

        <p className="auth-sub">
          Back to{" "}
          <Link to="/login" className="auth-link">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Forget_Password;
