const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;
    
    // Check if user exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE user_email = ? OR user_name = ?', 
      [email, username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (user_name, user_email, password, user_type) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, userType]
    );

    // Generate token
    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({ token, userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({ token, userId: user.user_id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;