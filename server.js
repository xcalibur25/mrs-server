const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const dotenv = require("dotenv").config();
const connectDB = require("./config/dbConnection")
const port = process.env.PORT || 4001;
connectDB();
// App initialization
const app = express();
app.use(bodyParser.json());
app.use(cors());



// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// JWT secret key
const SECRET_KEY = process.env.SECRET_KEY;



// Register Endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log("Username: ", username)
    console.log("Password: ", password)
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword)
    try {
        const user = await User.create({ username, password: hashedPassword });
        console.log("New user details: ", user)
        res.json({ message: 'User registered successfully!' });
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: 'Username already exists!' });
    }
});



// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});



// Middleware to verify token
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied!' });

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token!' });
    }
};



// Search Endpoint (calls Python functionality)
app.post('/recommend', async (req, res) => {
    const { movie } = req.body;
    console.log('Movie name: ', movie)
    // Call the Python script via REST or subprocess
    const movie_name=movie
    try {
        const pythonResponse = await axios.post('http://52.3.18.150:5000/search', { movie_name },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log("Python Response: ", pythonResponse)
        res.json(pythonResponse.data);
    } catch (err) {
        res.status(500).json({ error: 'Error calling Python service' });
    }
});



// Start server
app.listen(port, () => {
    console.log('Server running on http://localhost:4000');
});
