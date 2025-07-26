const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each user/IP to 10 requests per windowMs
  keyGenerator: (req) => {
    if (req.user && req.user._id) return req.user._id.toString();
    return req.ip;
  },
  message: 'Too many requests, please try again later.',
});

module.exports = authRateLimiter; 