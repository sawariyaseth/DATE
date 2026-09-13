const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// basic in-memory rate limit
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

app.use(express.json());

// Serve frontend files from repo root
app.use(express.static(__dirname));

app.post("/send-date-email", async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const { name, email, date, time, company } = req.body || {};

    if (company) {
      return res.status(200).json({ status: "success" }); // honeypot
    }

    if (!email || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.MY_EMAIL_ADDRESS) {
      return res.status(500).json({ error: "Email service is not configured on server" });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.MY_EMAIL_ADDRESS,
      replyTo: email,
      subject: "We have a date! 💕",
      text: `Name: ${name}\nEmail: ${email}\nDate: ${date}\nTime: ${time}`
    });

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Error sending date/time email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// fallback to index.html
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
