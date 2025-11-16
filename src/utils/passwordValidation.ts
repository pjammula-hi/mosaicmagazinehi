/**
 * Password Validation Utility
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters - using negation of alphanumeric
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
} {
  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Patterns
  if (/[A-Z].*[A-Z]/.test(password)) score++; // Multiple uppercase
  if (/[0-9].*[0-9]/.test(password)) score++; // Multiple numbers

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 6) strength = 'medium';
  if (score >= 8) strength = 'strong';

  return { strength, score };
}

export function checkPasswordExpiry(lastChangeDate: string | null): {
  isExpired: boolean;
  daysRemaining: number;
} {
  if (!lastChangeDate) {
    return { isExpired: true, daysRemaining: 0 };
  }

  const lastChange = new Date(lastChangeDate);
  const now = new Date();
  const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = 90 - daysSinceChange;

  return {
    isExpired: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining)
  };
}
