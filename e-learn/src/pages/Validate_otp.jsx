import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function Validate_otp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [form, setForm] = useState({
    num1: "",
    num2: "",
    num3: "",
    num4: "",
    num5: "",
    num6: "",
  });
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const otpValues = [
    form.num1,
    form.num2,
    form.num3,
    form.num4,
    form.num5,
    form.num6,
  ];

  const handleotp = async () => {
    try {
      setOtpError("");
      setOtpSuccess("");

      if (!email) {
        setOtpError("Missing signup email. Please start again from the signup page.");
        return;
      }

      const otp = otpValues.join("");
      if (otp.length !== 6) {
        setOtpError("Please enter the full 6-digit OTP.");
        return;
      }

      const response = await axios.post(
        "/api/auth/verify-otp",
        { email, otp },
        { withCredentials: true }
      );

      console.log(response.data);
      setOtpSuccess(response.data.message || "OTP verified successfully.");
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError(
        error.response?.data?.message || "OTP verification failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Verify OTP</h1>
        <p className="auth-sub">
          Enter the 6-digit code sent to your email.
        </p>
        <p className="auth-sub">
          {email || "No signup email found"}
        </p>

        <div className="form-group">
          <label className="form-label">Verification Code</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "10px",
            }}
          >
            {otpValues.map((value, index) => (
              <input
                key={index}
                className="form-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                placeholder="0"
                style={{ textAlign: "center" }}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [`num${index + 1}`]: e.target.value.replace(/\D/g, "").slice(0, 1),
                  })
                }
              />
            ))}
          </div>
        </div>

        <p className="terms">
          Didn&apos;t get the code? <span>Resend OTP</span>
        </p>

        {otpError && (
          <p style={{ color: "red", fontSize: "14px" }}>
            {otpError}
          </p>
        )}

        {otpSuccess && (
          <p style={{ color: "green", fontSize: "14px" }}>
            {otpSuccess}
          </p>
        )}

        <button className="btn-primary" style={{ width: "100%" }} onClick={handleotp}>
          Verify Code
        </button>

        <div className="divider">or</div>

        <p className="auth-sub">
          Back to{" "}
          <Link to="/signup" className="auth-link">
            sign up
          </Link>
        </p>
      </div>
    </div>

  );
}
