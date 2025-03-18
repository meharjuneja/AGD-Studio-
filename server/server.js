const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

dotenv.config();

// ────────────────────────────────────────────────
// ✅ Initialize App
// ────────────────────────────────────────────────
const app = express();

// ────────────────────────────────────────────────
// ✅ Middleware Configuration
// ────────────────────────────────────────────────
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Rate limiting for subscription endpoint
app.use("/subscribe", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
}));

// ────────────────────────────────────────────────
// ✅ Database Connection
// ────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// ────────────────────────────────────────────────
// ✅ Models
// ────────────────────────────────────────────────
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: "Invalid email format"
    }
  }
}, { timestamps: true });

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  reason: String,  // ✅ Stored as submitted
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

// ────────────────────────────────────────────────
// ✅ Brevo SMTP Configuration
// ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "87fc7d008@smtp-brevo.com",
    pass: "ACPHrWytcxkj7TdV"
  },
  tls: {
    ciphers: "SSLv3"
  }
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Brevo SMTP Connection Failed:", error);
  } else {
    console.log("✅ Brevo SMTP Authenticated Successfully");
  }
});

// ────────────────────────────────────────────────
// ✅ Routes
// ────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Test Email Route
app.post("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: '"Test Server" <your-email@example.com>',
      to: "satyam.sk.026@gmail.com",
      subject: "SMTP Test Successful!",
      text: "Your Brevo SMTP configuration is working!"
    });
    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({ error: "Test email failed" });
  }
});

// ✅ Newsletter Subscription
app.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: "Valid email required" });
    }

    const exists = await Subscriber.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already subscribed" });

    const subscriber = await Subscriber.create({ email: email.toLowerCase() });

    await transporter.sendMail({
      from: '"Newsletter" <studiosagd@gmail.com>',
      to: email,
      subject: "Subscription Confirmed!",
      html: `<div style="font-family: Arial; padding: 20px;">
              <h2 style="color: #2563eb;">Welcome!</h2>
              <p>You're now subscribed to our newsletter.</p>
            </div>`
    });

    res.status(201).json({
      success: true,
      message: "Subscription successful",
      email: subscriber.email
    });

  } catch (error) {
    console.error("Subscription Error:", error);
    const status = error.code === 11000 ? 409 : 500;
    res.status(status).json({ 
      error: status === 500 ? "Server error" : "Email already subscribed"
    });
  }
});

// ✅ Contact Form Submission Route
app.post("/addContact", async (req, res) => {
  try {
    const { firstName, lastName, email, reason, message } = req.body;

    if (!firstName || !lastName || !email || !reason) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // ✅ Log form submission in terminal
    console.log("\n📩 New Contact Form Submission:");
    console.log(`🔹 Name: ${firstName} ${lastName}`);
    console.log(`🔹 Email: ${email}`);
    console.log(`🔹 Reason: ${reason}`);  // ✅ Logs exact reason in terminal
    console.log(`🔹 Message: ${message}`);
    console.log("───────────────────────────────");

    // ✅ Store in MongoDB
    const newContact = new Contact({ firstName, lastName, email, reason, message });
    await newContact.save();

    // ✅ Send Email Notification
    await transporter.sendMail({
      from: `"New Contact Form Submission" <your-email@example.com>`,
      to: "your-email@example.com", // Replace with recipient email
      subject: "New Contact Form Submission",
      text: `You have received a new message from ${firstName} ${lastName}.\n\nReason: ${reason}\nMessage: ${message}\nEmail: ${email}`
    });

    res.status(201).json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("Contact form submission error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ────────────────────────────────────────────────
// ✅ Start Server
// ────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
