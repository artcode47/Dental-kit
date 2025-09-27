// Shared password strength calculator and helpers

export function calculatePasswordStrength(password) {
  if (!password) return { score: 0, feedback: [] };

  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1; else feedback.push('validation.password.min');
  if (/[a-z]/.test(password)) score += 1; else feedback.push('validation.password.lowercase');
  if (/[A-Z]/.test(password)) score += 1; else feedback.push('validation.password.uppercase');
  if (/[0-9]/.test(password)) score += 1; else feedback.push('validation.password.number');
  if (/[^A-Za-z0-9]/.test(password)) score += 1; else feedback.push('validation.password.symbol');

  return { score, feedback };
}

export function isPasswordStrongEnough(score, minScore = 4) {
  return score >= minScore;
}


