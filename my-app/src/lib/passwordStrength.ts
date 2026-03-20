// Shared password strength logic — used in register, reset-password, change-password.

export type StrengthLevel = "none" | "weak" | "medium" | "strong" | "very-strong";

export interface PasswordStrength {
  level:  StrengthLevel;
  score:  number;
  label:  string;
  valid:  boolean;   // meets minimum requirements
  errors: string[];  // list of unmet requirements
}

export function getPasswordStrength(p: string): PasswordStrength {
  if (!p) return { level: "none", score: 0, label: "", valid: false, errors: [] };

  let score = 0;
  const errors: string[] = [];

  // Minimum requirements (must all pass)
  const hasLower   = /[a-z]/.test(p);
  const hasUpper   = /[A-Z]/.test(p);
  const hasNumber  = /\d/.test(p);
  const hasSymbol  = /[^a-zA-Z0-9]/.test(p);
  const hasMin8    = p.length >= 8;

  if (!hasMin8)   errors.push("At least 8 characters");
  if (!hasLower)  errors.push("At least 1 lowercase letter");
  if (!hasUpper)  errors.push("At least 1 uppercase letter");
  if (!hasNumber) errors.push("At least 1 number");
  if (!hasSymbol) errors.push("At least 1 symbol");

  const valid = errors.length === 0;

  // Score system
  if (hasMin8)          score += 1;
  if (p.length >= 12)   score += 1;
  if (p.length >= 16)   score += 1;  // bonus
  if (hasLower)         score += 1;
  if (hasUpper)         score += 1;
  if (hasNumber)        score += 1;
  if (hasSymbol)        score += 1;

  let level:  StrengthLevel;
  let label:  string;

  if      (score <= 2) { level = "weak";        label = "Weak";        }
  else if (score <= 4) { level = "medium";      label = "Medium";      }
  else if (score <= 6) { level = "strong";      label = "Strong";      }
  else                 { level = "very-strong"; label = "Very Strong"; }

  return { level, score, label, valid, errors };
}
