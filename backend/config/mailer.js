import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  pool: true,
  maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
  maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
  // Prevent request from hanging for too long when SMTP is slow/unreachable.
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 20000),
  auth: {
    user: process.env.SMTP_USER || 'mohanapyropark@gmail.com',
    pass: process.env.SMTP_PASS || ''
  }
});

export default transporter;
