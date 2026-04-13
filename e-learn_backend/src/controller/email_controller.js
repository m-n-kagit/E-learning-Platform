
import Email from "../utils/send_email.js";
import sanitizeHtml from "sanitize-html";


// const stripSqlKeywords = (value = "") =>
//   String(value).replace(
//     /\b(select|insert|update|delete|drop|alter|truncate|modify|create|replace|where|union|join|exec|execute)\b/gi,
//     ""
//   ); not used for MongoDB

const ensureString = (value) => {
  if (typeof value !== "string") {
    throw new Error("Invalid input: expected string");
  }
  return value;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeEmailAddress = (value = "") =>{
  const str= ensureString(value)
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");
 

  // Step 2: Clean HTML (prevent XSS)
  const cleanHtml = sanitizeHtml(str, {
    allowedTags: [], // or define allowed ones
    allowedAttributes: {}
  });

  return cleanHtml;
  
}


const sanitizeMessage = (value = "") => {
  const str = ensureString(value);

  // Step 1: Remove MongoDB injection payloads


  // Step 2: Clean HTML (prevent XSS)
  const cleanHtml = sanitizeHtml(str, {
    allowedTags: [], // or define allowed ones
    allowedAttributes: {}
  });

  return cleanHtml;
};


    

const receiveEmail = async (req, res) => {
  try {
    const { to, from, subject, message } = req.body;

    const sanitizedTo = sanitizeEmailAddress(to);
    const sanitizedFrom = sanitizeEmailAddress(from);
    const sanitizedSubject = sanitizeMessage(subject);
    const sanitizedMessage = sanitizeMessage(message);
    console.log("Sanitized Inputs:", {
      to: sanitizedTo,
      from: sanitizedFrom,
      subject: sanitizedSubject,
      message: sanitizedMessage
    });
    await Email.receiveEmail(
      sanitizedTo,
      sanitizedFrom,
      `<p><strong>From:</strong> ${escapeHtml(sanitizedFrom)}</p>
       <p><strong>Subject:</strong> ${escapeHtml(sanitizedSubject)}</p>
       <p><strong>Message:</strong><br>${escapeHtml(sanitizedMessage).replace(/\n/g, "<br>")}</p>`
    );
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
   }
};

export default { receiveEmail };
