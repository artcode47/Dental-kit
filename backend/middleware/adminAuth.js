const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');

const userService = new UserService();

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await userService.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified' });
    }
    
    // Check if user has admin privileges
    const adminRoles = ['admin', 'super_admin', 'it_admin'];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
}; 