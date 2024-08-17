// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    console.log('Auth middleware - headers:', req.headers);
    const token = req.header('Authorization');
    if (!token) {
      throw new Error('No token provided');
    }
    console.log('Token received:', token);
    
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    console.log('User found:', user);
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Please authenticate', error: error.message });
  }
};



