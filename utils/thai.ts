/**
 * Normalize Thai text for search: trim, NFC, and fold the decomposed
 * nikhahit + sara aa (U+0E4D U+0E32) into sara am (U+0E33), which NFC
 * leaves alone.
 */
export function normalizeThai(s: string): string {
  return s.trim().normalize("NFC").replace(/ํา/g, "ำ")
}
