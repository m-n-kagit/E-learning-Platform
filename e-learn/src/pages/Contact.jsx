import { useState } from "react";
import axios from "axios";
import Footer from "../components/Footer";

const contactItems = [
  { i: "📧", l: "Email",  v: "mohithyper007@gmail.com"   },
  { i: "📞", l: "Phone",  v: "+91  8440094408"     },
  { i: "📍", l: "Office", v: "BanderSindri, Kishangarhv, Ajmer" },
  { i: "🕒", l: "Hours",  v: "Mon–Fri, 9am–6pm PST"   },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [done, setDone] = useState(false);
  const sendEmail = async () => {
    try {
      await axios.post("/api/emails/contact", {
        to: "mohithyper007@gmail.com",
        from: form.email,
        subject: form.subject,
        message: form.message
      });
      setDone(true);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const stripSqlKeywords = (value) =>
    value.replace(
      /\b(select|insert|update|delete|drop|alter|truncate|modify|create|replace|where|union|join|exec|execute)\b/gi,
      ""
    );

  const sanitizeName = (value) =>
    stripSqlKeywords(value)
      .replace(/[^a-zA-Z\s'-]/g, "") //not a chacter, space, apostrophe, or hyphen
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/, "");

  const sanitizeEmail = (value) =>
    stripSqlKeywords(value)
      .trim()
      .toLowerCase()
      .replace(/\s/g, "");

  const sanitizeSingleLine = (value) =>
    stripSqlKeywords(value)
      .replace(/[<>]/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/, "");

  const sanitizeMessage = (value) =>
    stripSqlKeywords(value)
      .replace(/[<>]/g, "")
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n");

  const handle = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "name") sanitizedValue = sanitizeName(value);
    if (name === "email") sanitizedValue = sanitizeEmail(value);
    if (name === "subject") sanitizedValue = sanitizeSingleLine(value);
    if (name === "message") sanitizedValue = sanitizeMessage(value);

    setForm({ ...form, [name]: sanitizedValue });
  };

  const submit = () => {
    const cleanedForm = {
      name: sanitizeName(form.name).trim(),
      email: sanitizeEmail(form.email),
      subject: sanitizeSingleLine(form.subject).trim(),
      message: sanitizeMessage(form.message).trim(),
    };

    setForm(cleanedForm);
    if (cleanedForm.name && cleanedForm.email && cleanedForm.message) {
      sendEmail();
    }
  };

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-label">Reach Out</div>
          <h1 className="page-title">We'd Love to Hear From You</h1>
          <p className="page-sub">
            Questions, feedback, or partnership inquiries — our team typically responds within a few hours.
          </p>
        </div>
      </div>

      <div className="contact-body">
        <div className="contact-info">
          <h2>Contact Details</h2>
          <p>Our support team is available Monday to Friday and happy to help with anything you need.</p>
          <div className="ci-list">
            {contactItems.map((c) => (
              <div className="ci-row" key={c.l}>
                <div className="ci-icon">{c.i}</div>
                <div>
                  <div className="ci-label">{c.l}</div>
                  <div className="ci-val">{c.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-card">
          {done ? (
            <div className="success-box">
              <div className="s-icon">✅</div>
              <h3>Message Sent</h3>
              <p>We'll get back to you within 2–4 business hours.</p>
              <button className="btn-primary"
                onClick={() => { setDone(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                Send Another
              </button>
            </div>
          ) : (
            <>
              <h3>Send a Message</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" name="email" value={form.email} onChange={handle} placeholder="you@email.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" name="subject" value={form.subject} onChange={handle} placeholder="How can we help?" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" name="message" value={form.message} onChange={handle} placeholder="Tell us more..." />
              </div>
              <button className="btn-primary" style={{ width: "100%" }} onClick={submit}>
                Send Message
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
