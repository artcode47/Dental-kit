const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const AUDIT_LOG_PATH = path.join(__dirname, '../logs/audit.log');

function getLastHash() {
  if (!fs.existsSync(AUDIT_LOG_PATH)) return '';
  const lines = fs.readFileSync(AUDIT_LOG_PATH, 'utf8').trim().split('\n');
  if (lines.length === 0) return '';
  const last = lines[lines.length - 1];
  try {
    return JSON.parse(last).hash || '';
  } catch {
    return '';
  }
}

function auditLog(userId, action, details = '') {
  const prevHash = getLastHash();
  const entry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    details,
    prevHash,
  };
  entry.hash = crypto.createHash('sha256').update(JSON.stringify(entry) + prevHash).digest('hex');
  fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + '\n');
}

module.exports = auditLog; 