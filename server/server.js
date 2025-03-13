const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors({ origin: "*" })); // Allow all origins

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  reason: { type: String, required: true },
  message: { type: String },
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

// API Route to Handle Contact Form Submission
app.post("/addContact", async (req, res) => {
  console.log("📩 Form Data Received:", req.body);

  try {
    const contact = new Contact(req.body);
    await contact.save();
    console.log("✅ Contact saved successfully:", contact);
    res.status(201).json({ message: "Contact saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving contact:", error);
    res.status(400).json({ error: "Failed to save contact" });
  }
});

// Default Route to Prevent "Cannot GET /" Error
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
