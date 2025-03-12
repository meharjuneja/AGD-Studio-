// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Contact = require('./models/Contact');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from project root
app.use(express.static(path.join(__dirname, '../')));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('📦 Connected to MongoDB Atlas');
  } catch (err) {
    console.error('💥 Database connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Contact form submission endpoint
app.post('/submit-form', async (req, res) => {
  try {
    const { firstName, lastName, email, reason, message } = req.body;
    
    // Server-side validation
    if (!firstName || !lastName || !email || !reason || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newContact = new Contact({
      firstName,
      lastName,
      email,
      reason,
      message
    });

    await newContact.save();
    res.status(201).json({
      success: true,
      message: 'Form submitted successfully!'
    });

  } catch (error) {
    console.error('🚨 Submission error:', error);
    res.status(500).json({
      error: error.name === 'ValidationError' 
        ? Object.values(error.errors).map(e => e.message).join(', ')
        : 'Server error. Please try again later.'
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});