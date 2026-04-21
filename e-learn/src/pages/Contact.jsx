import { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import sanitizeHtml from "sanitize-html";

const contactItems = [
  { i: "📧", l: "Email",  v: "mohithyper007@gmail.com"   },
  { i: "📞", l: "Phone",  v: "+91  8440094408"     },
  { i: "📍", l: "Office", v: "BanderSindri, Kishangarhv, Ajmer" },
  { i: "🕒", l: "Hours",  v: "Mon–Fri, 9am–6pm PST"   },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [done, setDone] = useState(false);
  const [showError,setError] = useState(false);
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


  const handle = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "name") {sanitizedValue = sanitizeHtml(value,{allowedTags: [], allowedAttributes: {}}) 
    if(sanitizedValue!=value){ setError(true)} else{setError(false)};}
    if (name === "email") {sanitizedValue = sanitizeHtml(value,{allowedTags: [], allowedAttributes: {}});
    if(sanitizedValue!=value) {setError(true)} else{setError(false)};
  }
    if (name === "subject") {sanitizedValue = sanitizeHtml(value,{allowedTags: [], allowedAttributes: {}});
    if(sanitizedValue!=value) {setError(true)} else{setError(false)};
  }
    if (name === "message") {sanitizedValue = sanitizeHtml(value,{allowedTags: [], allowedAttributes: {}});
    if(sanitizedValue!=value) {setError(true)} else{setError(false)};
  }

    setForm({ ...form, [name]: value});
  };

  useEffect(() => {
    
    
  }, [showError]);

  const submit = () => {
    const cleanedForm = {
      name: sanitizeHtml(form.name),
      email: sanitizeHtml(form.email),
      subject: sanitizeHtml(form.subject),
      message: sanitizeHtml(form.message),
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
              <div style={{ display: showError? "block" : "none", color: "red", marginTop: "10px" }}>
                Tags or any HTML elements are not allowed in the form fields.
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
