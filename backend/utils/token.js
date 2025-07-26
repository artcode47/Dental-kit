const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateJWT(payload, expiresIn = '1h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

module.exports = {
  generateJWT,
  generateRandomToken,
  generateRefreshToken,
}; 