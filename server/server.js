require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware: Enable CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

// Connect to MongoDB using your connection string from .env
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a schema for the contact form data
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  reason: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Create a model from the schema
const Contact = mongoose.model("Contact", contactSchema);

// POST endpoint to receive form submissions
app.post("/submit-form", async (req, res) => {
  try {
    const { firstName, lastName, email, reason, message } = req.body;
    // Create a new Contact document with the form data
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      reason,
      message,
    });
    // Save the document to MongoDB
    await newContact.save();

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error while saving form data:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error. Please try again later.",
      });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
