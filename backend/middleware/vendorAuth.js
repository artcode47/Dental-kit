const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');

const userService = new UserService();

module.exports = async function (req, res, next) {
  try {
    // Ensure auth middleware ran first and set req.user
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.getById(decoded.id);
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = user;
    }

    const allowedRoles = ['vendor', 'admin', 'super_admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Vendor privileges required.' });
    }

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




