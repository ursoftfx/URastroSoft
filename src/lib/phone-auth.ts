// Phone+Password auth helper: we use Supabase email auth with a synthetic
// internal email derived from the phone number, while storing the real phone
// in the `profiles` table. This avoids needing an SMS provider.

export const PHONE_EMAIL_DOMAIN = "phone.kanagadara.local";

export function normalizePhone(input: string): string {
  // Keep only digits and a leading +
  const trimmed = input.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/\D/g, "");
  return plus + digits;
}

export function phoneToEmail(phone: string): string {
  const digits = normalizePhone(phone).replace(/^\+/, "");
  return `${digits}@${PHONE_EMAIL_DOMAIN}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone).replace(/^\+/, "");
  return digits.length >= 8 && digits.length <= 15;
}
