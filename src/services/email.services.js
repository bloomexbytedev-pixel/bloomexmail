import nodemailer from "nodemailer";

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required to send emails`);
  }

  return value;
};

const getTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  console.log("SMTP verified successfully");
  return nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    // requireTLS: true,
    // family: 4,
    // connectionTimeout: 20000,
    // greetingTimeout: 20000,
    // socketTimeout: 20000,
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS"),
    },
    // tls: {
    //   rejectUnauthorized: false,
    // },
  });
};

export const sendEmail = async ({ to, subject, message, html, text }) => {
  if (!to) {
    throw new Error("Email recipient is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  const htmlBody = html || message;
  const textBody = text || (htmlBody ? undefined : message);

  if (!htmlBody && !textBody) {
    throw new Error("Email message is required");
  }

  const transporter = getTransporter();

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html: htmlBody,
    text: textBody,
  });
};

export const verifyEmailService = async () => {
  const transporter = getTransporter();

  console.log("Verifying SMTP...");

  const result = await transporter.verify();

  console.log("SMTP Verify Result:", result);

  return result;
};
