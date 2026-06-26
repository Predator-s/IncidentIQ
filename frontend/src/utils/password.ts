// Shared password policy — kept in parity with the backend zod schema.
// At least 8 chars, with at least one letter and one number.
export const PASSWORD_HINT = "At least 8 characters, including a letter and a number";

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password)) return "Password must include a letter";
  if (!/[0-9]/.test(password)) return "Password must include a number";
  return null;
}
