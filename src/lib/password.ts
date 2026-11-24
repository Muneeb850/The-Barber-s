/** Basic password strength rules for admin accounts. Returns an error message or null. */
export function passwordProblem(pw: string, confirm: string): string | null {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) return "Use letters and at least one number.";
  if (pw !== confirm) return "Passwords don't match.";
  return null;
}
