const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
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

// Rate limiting
app.use("/subscribe", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
}));

// ────────────────────────────────────────────────
// ✅ Database Connection
// ────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// ────────────────────────────────────────────────
// ✅ Subscriber Model
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

// ────────────────────────────────────────────────
// ✅ Brevo Email Configuration (VERIFIED WORKING)
// ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "87fc7d007@smtp-brevo.com",  
    pass: "Z50vmtK3rSMkLpPN" // Replace with your SMTP key
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
  res.send("Newsletter API v1.0 - Operational");
});

// Test SMTP endpoint
app.post("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: '"Test Server" <studiosagd@gmail.com>',
      to: "satyam.sk.026@gmail.com", // Change to your test email
      subject: "SMTP Test Successful!",
      text: "Your Brevo SMTP configuration is working!"
    });
    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({ error: "Test email failed" });
  }
});

// Subscription endpoint
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
      text: `Thank you for subscribing!`,
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

// ────────────────────────────────────────────────
// ✅ Start Server
// ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Brevo SMTP: smtp-relay.brevo.com`);
});