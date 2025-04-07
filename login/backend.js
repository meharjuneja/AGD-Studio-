const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key'; // Use secret key from .env or fallback
const DATA_FILE = 'users.json';

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for frontend integration

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    console.error('Full error:', err);
});

// Define a User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema, 'login-signup');

// Ping API
app.get('/ping', (req, res) => {
    res.json({ message: "Server is running" });
});

// Signup API
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});