const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get("/", (_req, res) => {
  res.status(200).send("Server is running ✅");
});

app.get("/api/send-date-email", (_req, res) => {
  res.status(405).json({ error: "Method Not Allowed. Use POST." });
});

app.post("/api/send-date-email", async (req, res) => {
  try {
    const { name, email, date, time } = req.body;

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: "Missing required fields: name, email, date, time" });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "RESEND_API_KEY is not set" });
    }

    const toEmail = process.env.MY_EMAIL_ADDRESS;
    if (!toEmail) {
      return res.status(500).json({ error: "MY_EMAIL_ADDRESS is not set" });
    }

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [toEmail],
      subject: "New Date Submission 💌",
      html: `
        <h2>New Date Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      `,
      replyTo: email,
    });

    if (error) {
      console.error("Resend send error:", error);
      return res.status(500).json({ error: "Failed to send email", details: error });
    }

    return res.status(200).json({ success: true, id: data?.id || null });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
