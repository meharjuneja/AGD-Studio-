const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Newsletter Schema
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// Email Transporter (Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// API to Handle Newsletter Subscriptions
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Save Email in Database
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send Thank You Email
    const mailOptions = {
      from: `"Your Company" <${process.env.BREVO_USER}>`,
      to: email,
      subject: "Thank You for Subscribing!",
      text: `Hi there,\n\nThank you for signing up for our newsletter! Stay tuned for updates.\n\nBest Regards,\nYour Company`,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent to:", email);
    res.status(201).json({ message: "Subscription successful. Email sent!" });

  } catch (error) {
    console.error("❌ Error subscribing:", error);
    res.status(500).json({ error: "Subscription failed" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
