// Store every phone number the same way so login always matches:
// "+880 1712-345678" and "01712345678" both become "01712345678".
export function normalizePhone(input) {
  let digits = String(input ?? "").replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  return digits;
}
