const nodemailer = require('nodemailer');

const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends an email if SMTP is configured; otherwise logs to console so local
 * development and demos keep working without real credentials.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!isConfigured) {
    console.log(`[LocalFix][email:fallback] To: ${to} | Subject: ${subject}`);
    return { delivered: false, fallback: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'LocalFix <no-reply@localfix.app>',
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });
    return { delivered: true, fallback: false };
  } catch (error) {
    console.error(`[LocalFix][email:error] Failed to send to ${to}:`, error.message);
    return { delivered: false, fallback: false, error: error.message };
  }
};

module.exports = sendEmail;
