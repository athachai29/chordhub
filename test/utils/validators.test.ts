import { it, expect } from "vitest"
import { isEmailValid, isPasswordValid } from "#shared/utils/validators"

it.each([
  ["a@b.co", true],
  ["first.last@chordhub.app", true],
  ["ก@ข.ค", true],
  ["a@b", false],
  ["a b@c.d", false],
  ["@b.co", false],
  ["", false],
])("isEmailValid(%j) → %s", (e, ok) => expect(isEmailValid(e)).toBe(ok))

it.each([
  ["1234567", false],
  ["12345678", true],
  ["", false],
])("isPasswordValid(%j) → %s", (p, ok) => expect(isPasswordValid(p)).toBe(ok))
