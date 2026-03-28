import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import pass_word_verify from "./pass_validator.js";

export default function Validate_otp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const mode = location.state?.mode || "signup";
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
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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
      setPasswordError("");
      setPasswordSuccess("");

      if (!email) {
        setOtpError(
          mode === "reset-password"
            ? "Missing reset email. Please start again from the forgot password page."
            : "Missing signup email. Please start again from the signup page."
        );
        return;
      }

      const otp = otpValues.join("");
      if (otp.length !== 6) {
        setOtpError("Please enter the full 6-digit OTP.");
        return;
      }

      const response = await axios.post(
        mode === "reset-password"
          ? "/api/auth/verify-otp-forget-password"
          : "/api/auth/verify-otp",
        { email, otp },
        { withCredentials: true }
      );

      console.log(response.data);
      setOtpSuccess(
        response.data.message ||
          (mode === "reset-password"
            ? "OTP verified successfully. You can now reset your password."
            : "OTP verified successfully.")
      );

      if (mode === "reset-password") {
        alert(
          response.data.message ||
            "OTP verified successfully. You can now reset your password."
        );
        setIsOtpVerified(true);
        return;
      }

      alert(response.data.message || "Signup completed successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError(
        error.response?.data?.message || "OTP verification failed. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      setOtpError("");
      setOtpSuccess("");

      if (!email) {
        setOtpError("Missing email. Please start the flow again.");
        return;
      }

      const endpoint =
        mode === "reset-password" ? "/api/auth/forget-password" : "/api/auth/send-otp";

      const response = await axios.post(
        endpoint,
        { email },
        { withCredentials: true }
      );// cookie is automatically included in the request for authentication

      setOtpSuccess(response.data.message || "OTP sent successfully.");
      alert(response.data.message || "OTP sent successfully.");
    } catch (error) {
      console.error("Error resending OTP:", error);
      setOtpError(
        error.response?.data?.message || "Unable to resend OTP right now."
      );
    }
  };

  const handlePasswordReset = async () => {
    try {
      setPasswordError("");
      setPasswordSuccess("");

      if (!isOtpVerified) {
        setPasswordError("Please verify the OTP first.");
        return;
      }

      if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
        setPasswordError("Please fill in both password fields.");
        return;
      }

      if (!pass_word_verify(passwordForm.newPassword)) {
        setPasswordError(
          "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
        );
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }

      setIsSubmittingPassword(true);

      const response = await axios.post(
        "/api/auth/enter-new-password",
        {
          email,
          new_password: passwordForm.newPassword,
        },
        { withCredentials: true }//withcredentials is used
        //  to include cookies in the request for authentication
      );

      setPasswordSuccess(response.data.message || "Password updated successfully.");
      alert(response.data.message || "Password updated successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(
        error.response?.data?.message || "Unable to update password right now."
      );
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Verify OTP</h1>
        <p className="auth-sub">
          {mode === "reset-password"
            ? "Enter the 6-digit code sent to your email to continue resetting your password."
            : "Enter the 6-digit code sent to your email."}
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
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
            }}
          >
           {isOtpVerified ? "" : "Resend OTP"  } 
          </button>
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

        <button className="btn-primary" style={{ width: "100%" }} onClick={handleotp} disabled={isOtpVerified}>
          Verify Code
        </button>

        {mode === "reset-password" && isOtpVerified && (
          <>
            <div className="divider">reset password</div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                value={passwordForm.newPassword}
                placeholder="Enter your new password"
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                value={passwordForm.confirmPassword}
                placeholder="Re-enter your new password"
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            {passwordError && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p style={{ color: "green", fontSize: "14px" }}>
                {passwordSuccess}
              </p>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={handlePasswordReset}
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </>
        )}

        <div className="divider">or</div>

        <p className="auth-sub">
          Back to{" "}
          <Link
            to={mode === "reset-password" ? "/login" : "/signup"}
            className="auth-link"
          >
            {mode === "reset-password" ? "sign in" : "sign up"}
          </Link>
        </p>
      </div>
    </div>

  );
}
