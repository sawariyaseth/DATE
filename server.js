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
//     const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // TLS via STARTTLS
//   requireTLS: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD
//   },
//   tls: {
//     family: 4 // force IPv4
//   }
// });
// const transporter = nodemailer.createTransport({
//   host: "74.125.69.108", // smtp.gmail.com IPv4 (one of Google's IPv4s)
//   port: 587,
//   secure: false,
//   requireTLS: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
//   tls: {
//     servername: "smtp.gmail.com", // keep TLS cert validation for Gmail hostname
//   },
// });
    const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Server is running ✅");
});

// Optional: GET on endpoint (so browser open won't confuse)
app.get("/api/send-date-email", (req, res) => {
  res.status(405).json({ error: "Method Not Allowed. Use POST." });
});

app.post("/api/send-date-email", async (req, res) => {
  try {
    const { name, email, date, time } = req.body;

    if (!name || !email || !date || !time) {
      return res.status(400).json({
        error: "Missing required fields: name, email, date, time",
      });
    }

    const serverTimestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "long",
    });

    const toEmail = process.env.MY_EMAIL_ADDRESS;
    if (!toEmail) {
      return res.status(500).json({ error: "MY_EMAIL_ADDRESS is not set" });
    }

    const fromEmail = "onboarding@resend.dev"; 
    // Later replace with your verified domain email, e.g. no-reply@yourdomain.com

    const subject = "New Date Submission 💌";

    const html = `
      <h2>New Date Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <hr/>
      <p><strong>Server Sent At:</strong> ${serverTimestamp}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      replyTo: email,
    });

    if (error) {
      console.error("Resend send error:", error);
      return res.status(500).json({ error: "Failed to send email", details: error });
    }

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      id: data?.id || null,
      serverTimestamp,
    });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
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
