import { it, expect } from "vitest"
import { normalizeThai } from "~/utils/thai"

it.each([
  ["ทํา", "ทำ"], // ทํา → ทำ
  ["น้ํา", "น้ำ"], // tone mark before: น้ํา → น้ำ
  ["  ใจ  ", "ใจ"],
  ["é", "é"],
  ["ทำ", "ทำ"],
])("normalizeThai(%j) → %j", (i, o) => expect(normalizeThai(i)).toBe(o))
