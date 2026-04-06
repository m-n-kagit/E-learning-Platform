import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Create a transporter using SMTP (Gmail in this case)

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS 
  // (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = ( to, subject, html ) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html
  });
}

const receiveEmail = (to, from , html)=>{
  return transporter.sendMail({
    from,
    to:process.env.SMTP_USER,
    subject:"Contact Form Submission",
    html
  })
}

export default {sendEmail, receiveEmail};
