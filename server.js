const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissionLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (submissionLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  submissionLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

app.post("/api/send-date-email", async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const { name, email, date, time, company } = req.body || {};

    if (company) return res.json({ status: "success" });

    if (!email || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.MY_EMAIL_ADDRESS) {
      return res.status(500).json({ error: "Email service not configured" });
    }

    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: process.env.GMAIL_USER,
    //     pass: process.env.GMAIL_APP_PASSWORD
    //   }
    // });
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS via STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    family: 4 // force IPv4
  }
});

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.MY_EMAIL_ADDRESS,
      replyTo: email,
      subject: "We have a date! 💕",
      text: `Name: ${name}\nEmail: ${email}\nDate: ${date}\nTime: ${time}`
    });

    return res.json({ status: "success" });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
