import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import validator from "./user_validator.js";
import pass_word_verify from "./pass_validator.js";
export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    adminPhoneNumber: "",
    verificationDocument: null,
  });
  const [signupError, setSignupError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const handleSignup = async () => {
    try {
      setSignupError("");
      setEmailError("");
      setPassError("");

      if (!form.name || !form.email || !form.password) {
        setSignupError("Please fill in all fields.");
        return;
      }

      if (!validator(form.email)) {
        setEmailError("Invalid email format");
        setSignupError("Please enter a valid email address.");
        return;
      }

      if (!pass_word_verify(form.password)) {
        setPassError(
          "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
        );
        setSignupError("Please enter a stronger password.");
        return;
      }

      if (form.role === "course_admin") {
        if (!form.adminPhoneNumber) {
          setSignupError("Please provide an admin contact number.");
          return;
        }

        if (!form.verificationDocument) {
          setSignupError("Please upload a PDF verification document for admin signup.");
          return;
        }

        const isPdf =
          form.verificationDocument.type === "application/pdf" ||
          form.verificationDocument.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          setSignupError("Only PDF documents are allowed for admin signup.");
          return;
        }
      }

      setIsSubmitting(true);

      const signupFormData = new FormData();
      signupFormData.append("name", form.name);
      signupFormData.append("email", form.email);
      signupFormData.append("password", form.password);
      signupFormData.append("role", form.role); 

      if (form.role === "course_admin") {
        signupFormData.append("adminPhoneNumber", form.adminPhoneNumber);
        signupFormData.append("verificationDocument", form.verificationDocument);
      }

      await axios.post("/api/auth/register-temp", signupFormData, {
        withCredentials: true,
      });

      await axios.post(
        "/api/auth/send-otp",
        { email: form.email },
        { withCredentials: true }
      );

      navigate("/validate-otp", {
        state: { email: form.email, mode: "signup" },
      });
    } catch (error) {
      console.error("Error creating account:", error);
      setSignupError(
        error.response?.data?.message || "Unable to continue signup right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            value={form.name} placeholder="Mohit Sharma"
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
          {emailError && (
            <p style={{ color: "red", fontSize: "14px" }}>
              {emailError}
            </p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input" type="password"
            value={form.password} placeholder="Min. 8 characters"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {passError && (
            <p style={{ color: "red", fontSize: "14px" }}>
              {passError}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="form-input"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
                adminPhoneNumber: e.target.value === "course_admin" ? form.adminPhoneNumber : "",
                verificationDocument: e.target.value === "course_admin" ? form.verificationDocument : null,
              })
            }
          >
            <option value="student">Student</option>
            <option value="course_admin">Course Admin</option>
          </select>
        </div>

        {form.role === "course_admin" && (
          <>
            <div className="form-group">
              <label className="form-label">Admin Contact Number</label>
              <input
                className="form-input"
                type="tel"
                value={form.adminPhoneNumber}
                placeholder="Enter your contact number"
                onChange={(e) =>
                  setForm({ ...form, adminPhoneNumber: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Verification Document (PDF)</label>
              <input
                className="form-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) =>
                  setForm({
                    ...form,
                    verificationDocument: e.target.files?.[0] || null,
                  })//the index value of 0 is taken here because
                  //  the file input allows for multiple files to be selected, but in this case we only want one file (the first one) to be uploaded as the verification document.
                }
              />
              <p className="terms">
                Upload an admin verification document in PDF format before continuing to OTP.
              </p>
            </div>
          </>
        )}

        <p className="terms">
          By signing up you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.
        </p>

        {signupError && (
          <p style={{ color: "red", fontSize: "14px" }}>
            {signupError}
          </p>
        )}

        <button className="btn-primary" style={{ width: "100%" }} onClick={handleSignup} disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <div className="divider">or sign up with</div>
      </div>
    </div>
  );
}
