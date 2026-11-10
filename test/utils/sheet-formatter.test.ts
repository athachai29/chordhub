import { it, expect } from "vitest"
import { IFormat, IIFormat, ZFormat } from "#shared/utils/sheet-formatter"

const A = (x: string) =>
  "<span class='chord'><span class='inner'>" + x + "</span></span>"

const f = new IFormat()
it.each([
  [
    "plain chord",
    "[C]Hello [G]world",
    `${A("<b>C</b>")}Hello ${A("<b>G</b>")}world`,
  ],
  ["bolds only first letter", "[Am7]la", `${A("<b>A</b>m7")}la`],
  [
    "sharp + slash chord",
    "[F#m]a[D/F#]b",
    `${A("<b>F</b>#m")}a${A("<b>D</b>/F#")}b`,
  ],
  [
    "adjacent chords share one anchor",
    "[Am][G]x",
    `${A("<b>A</b>m&nbsp;&nbsp;&nbsp;&nbsp;<b>G</b>")}x`,
  ],
  ["Thai lyric untouched", "[Am]ฉันรักเธอ", `${A("<b>A</b>m")}ฉันรักเธอ`],
  ["no chords unchanged", "ฉันรักเธอ", "ฉันรักเธอ"],
  ["malformed: Thai combining mark", "[ฺB]ก", `${A("ฺB")}ก`],
  ["malformed: trailing space", "[D ]ก", `${A("D ")}ก`],
  ["malformed: parentheses", "[C(add9)]ก", `${A("C(add9)")}ก`],
  [
    "English word containing INTRO stays lyric",
    "[C]Let me introduce",
    `${A("<b>C</b>")}Let me introduce`,
  ],
  [
    "English 'instrumental break' stays lyric",
    "[G]Play the instrumental break",
    `${A("<b>G</b>")}Play the instrumental break`,
  ],
  [
    "lowercase 'instrumental' mid-line stays lyric",
    "[C]an instrumental break",
    `${A("<b>C</b>")}an instrumental break`,
  ],
  [
    "lowercase 'intro' after chord stays lyric",
    "[C]intro to love",
    `${A("<b>C</b>")}intro to love`,
  ],
  [
    "'the intro' at line end stays lyric",
    "[Am]the intro",
    `${A("<b>A</b>m")}the intro`,
  ],
  [
    "'Intro-duce' after chord stays lyric",
    "[C]Intro-duce yourself",
    `${A("<b>C</b>")}Intro-duce yourself`,
  ],
  ["legacy &nbsp; kept", "a&nbsp;[C]b", `a&nbsp;${A("<b>C</b>")}b`],
  ["legacy <br> kept", "a<br>b", "a<br>b"],
  ["legacy <BR /> normalized", "a<BR />b", "a<br>b"],
  [
    "raw HTML escaped",
    "<img src=x onerror=alert(1)>",
    "&lt;img src=x onerror=alert(1)&gt;",
  ],
])("lyric part — %s", (_n, input, out) =>
  expect(f.format([input])).toEqual([out]),
)

it.each([
  ["INTRO : [G] ( 4 Times )", "INTRO : G  ( 4 Times )"],
  ["INSTRUC : [Em]|[Bm]|[C]", "INSTRUC : Em | Bm | C "],
  ["INSTRU : [Am]", "INSTRU : Am "],
  ["[C]|[G]", "C | G "],
  ["Intro : [G]", "Intro : G "],
  ["instrumental : [Am]", "instrumental : Am "],
  ["INTRO : <b>[G]", "INTRO : &lt;b&gt;G "],
  ["*INTRO* [G]", "*INTRO* G "],
  ["(Intro) [G]", "(Intro) G "],
  ["ดนตรี INTRO [G]", "ดนตรี INTRO G "],
  ["( REPEAT INTRO ) [G]", "( REPEAT INTRO ) G "],
])("non-lyric part %j → %j", (input, out) =>
  expect(f.format([input])).toEqual([out]),
)

it("does not mutate input; IFormat is 1:1", () => {
  const s = ["[C]a", "b", "c"],
    copy = [...s]
  expect(f.format(s)).toHaveLength(3)
  expect(s).toEqual(copy)
})
it("empty sheet → []", () => {
  for (const F of [IFormat, IIFormat, ZFormat])
    expect(new F().format([])).toEqual([])
})
it("IIFormat joins consecutive pairs", () =>
  expect(new IIFormat().format(["a", "b", "c", "d", "e"])).toEqual([
    "a b",
    "c d",
    "e",
  ]))
it("ZFormat currently equals IFormat", () => {
  const s = ["[C]a", "INTRO : [G]", "b"]
  expect(new ZFormat().format(s)).toEqual(new IFormat().format(s))
})
