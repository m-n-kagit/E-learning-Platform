
import Email from "../utils/send_email.js";

const stripSqlKeywords = (value = "") =>
  String(value).replace(
    /\b(select|insert|update|delete|drop|alter|truncate|modify|create|replace|where|union|join|exec|execute)\b/gi,
    ""
  );

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeEmailAddress = (value = "") =>
  stripSqlKeywords(value)
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");

const sanitizeSingleLine = (value = "") =>
  stripSqlKeywords(value)
    .replace(/[<>]/g, "")//bothered about angle brackets in subject line, 
    // as they could mess with HTML formatting of the email
    .replace(/\s{2,}/g, " ")
    .trim();

const sanitizeMessage = (value = "") =>
  stripSqlKeywords(value)
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const receiveEmail = async (req, res) => {
  try {
    const { to, from, subject, message } = req.body;

    const sanitizedTo = sanitizeEmailAddress(to);
    const sanitizedFrom = sanitizeEmailAddress(from);
    const sanitizedSubject = sanitizeSingleLine(subject);
    const sanitizedMessage = sanitizeMessage(message);

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
