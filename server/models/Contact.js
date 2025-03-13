const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    trim: true,
  },
  reason: {
    type: String,
    required: [true, "Reason is required"],
    enum: ["General", "Support", "Feedback"], // Matches the dropdown
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
  },
  robotCheck: {
    type: Boolean,
    required: [true, "Please confirm you are not a robot"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
