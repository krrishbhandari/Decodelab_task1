// Shared, pure password analysis logic (usable client + server).

export type Classification = "Weak" | "Medium" | "Strong" | "Very Strong";

export interface Check {
  id: string;
  label: string;
  passed: boolean;
}

export interface AnalysisResult {
  score: number; // 0..10
  strength: Classification;
  checks: Check[];
  feedback: string[];
  suggestions: string[];
  entropyBits: number;
  crackTime: string;
  improved: string;
  improvedReason: string[];
}

const COMMON = new Set([
  "password", "password1", "password123", "123456", "12345678", "qwerty",
  "abc123", "letmein", "welcome", "admin", "iloveyou", "monkey", "dragon",
  "111111", "000000", "qwerty123", "1q2w3e4r", "sunshine", "princess",
]);

const SEQUENCES = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function hasSequential(pw: string): boolean {
  const lower = pw.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lower.includes(seq.slice(i, i + 3))) return true;
    }
  }
  return false;
}

function hasRepeated(pw: string): boolean {
  return /(.)\1{2,}/.test(pw);
}

function poolSize(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  return pool || 1;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds > 1e17) return "Centuries";
  if (seconds < 1) return "Instant";
  const units: [number, string][] = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [365, "days"],
    [100, "years"],
    [Infinity, "centuries"],
  ];
  let value = seconds;
  const names = ["seconds", "minutes", "hours", "days", "years", "centuries"];
  let i = 0;
  for (; i < units.length - 1; i++) {
    if (value < units[i][0]) break;
    value /= units[i][0];
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${names[i]}`;
}

function generateImproved(pw: string): string {
  const specials = "!@#$%^&*";
  let base = pw || "Secure";
  // Capitalize first letter
  base = base.charAt(0).toUpperCase() + base.slice(1);
  // Leet swaps for readability
  base = base.replace(/a/g, "@").replace(/s/g, "$").replace(/o/g, "0").replace(/i/g, "1");
  // Ensure length >= 14
  while (base.length < 14) {
    base += specials[Math.floor(Math.random() * specials.length)];
    base += Math.floor(Math.random() * 10);
    base += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  // Ensure at least one special
  if (!/[^A-Za-z0-9]/.test(base)) base += "!";
  if (!/\d/.test(base)) base += "7";
  // Break repeats
  base = base.replace(/(.)\1{2,}/g, (m, c) => `${c}${c}${specials[0]}`);
  return base.slice(0, 20);
}

export function analyzePassword(pw: string): AnalysisResult {
  const password = pw ?? "";
  const checks: Check[] = [
    { id: "min", label: "At least 8 characters", passed: password.length >= 8 },
    { id: "rec", label: "12+ characters recommended", passed: password.length >= 12 },
    { id: "upper", label: "Contains uppercase letter", passed: /[A-Z]/.test(password) },
    { id: "lower", label: "Contains lowercase letter", passed: /[a-z]/.test(password) },
    { id: "num", label: "Contains a number", passed: /\d/.test(password) },
    { id: "special", label: "Contains a special character", passed: /[^A-Za-z0-9]/.test(password) },
    { id: "norepeat", label: "No repeated characters", passed: password.length > 0 && !hasRepeated(password) },
    { id: "noseq", label: "No sequential patterns", passed: password.length > 0 && !hasSequential(password) },
    { id: "uncommon", label: "Not a common password", passed: password.length > 0 && !COMMON.has(password.toLowerCase()) },
  ];

  let score = 0;
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 2;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 2;
  if (/[^A-Za-z0-9]/.test(password)) score += 2;
  if (password.length > 0 && !hasRepeated(password)) score += 1;
  if (hasSequential(password)) score -= 1;
  if (COMMON.has(password.toLowerCase())) score = Math.min(score, 1);
  score = Math.max(0, Math.min(10, score));

  let strength: Classification = "Weak";
  if (score >= 9) strength = "Very Strong";
  else if (score >= 7) strength = "Strong";
  else if (score >= 4) strength = "Medium";

  const feedback = checks.map((c) => `${c.passed ? "✔" : "✖"} ${c.label}`);

  const suggestions: string[] = [];
  if (password.length < 12) suggestions.push("Use at least 12 characters — longer is exponentially stronger.");
  if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters (A–Z).");
  if (!/[a-z]/.test(password)) suggestions.push("Add lowercase letters (a–z).");
  if (!/\d/.test(password)) suggestions.push("Include at least one number.");
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Add a special character like !@#$%.");
  if (hasRepeated(password)) suggestions.push("Avoid repeating the same character 3+ times.");
  if (hasSequential(password)) suggestions.push("Break up sequences like 'abc' or '123'.");
  if (COMMON.has(password.toLowerCase())) suggestions.push("Replace this common password with something unique.");

  const entropyBits = password.length ? Math.round(password.length * Math.log2(poolSize(password))) : 0;
  const guessesPerSec = 1e10; // offline attacker
  const crackTime = password.length ? formatTime(Math.pow(2, entropyBits) / guessesPerSec) : "—";

  const improved = generateImproved(password);
  const improvedReason = [
    "Mixes upper, lower, digits and symbols",
    "Length increased beyond 12 characters",
    "Predictable letters replaced with symbols",
    "No 3-character repeats or sequences",
  ];

  return { score, strength, checks, feedback, suggestions, entropyBits, crackTime, improved, improvedReason };
}

export function generateRandomPassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  let out = "";
  const cryptoObj = typeof crypto !== "undefined" ? crypto : undefined;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const arr = new Uint32Array(length);
    cryptoObj.getRandomValues(arr);
    for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  }
  // Guarantee category coverage
  if (!/[A-Z]/.test(out)) out = "A" + out.slice(1);
  if (!/[a-z]/.test(out)) out = out.slice(0, -1) + "a";
  if (!/\d/.test(out)) out = out.slice(0, -2) + "7" + out.slice(-1);
  if (!/[^A-Za-z0-9]/.test(out)) out = out.slice(0, -3) + "!" + out.slice(-2);
  return out;
}