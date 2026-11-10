abstract class SheetFormatter {
  private static BR_SENTINEL = "\u0000BR\u0000"

  private escapeHtml(part: string): string {
    return part
      .replaceAll(/<br\s*\/?>/gi, SheetFormatter.BR_SENTINEL)
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll(SheetFormatter.BR_SENTINEL, "<br>")
  }

  private removeSquareBrackets(part: string) {
    return part.replaceAll("[", "").replaceAll("]", " ").replaceAll("|", "| ")
  }

  private applyChordStyling(part: string) {
    return (
      part
        // Bold every first letter chord
        .replaceAll(/\[[a-zA-Z0-9/#]+\]/g, (match) => {
          return `[<b>${match[1]}</b>${match.slice(2, -1)}]`
        })
        .replaceAll("][", "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replaceAll("[", "<span class='chord'><span class='inner'>")
        .replaceAll("]", "</span></span>")
    )
  }

  public isNotLyric(part: string) {
    return (
      // Any case, but only as the part's first word ("Intro : [G]")
      /^[^A-Za-z]*(INTRO|INSTRU(C|MENT(AL)?)?)\b/i.test(part) ||
      // Uppercase anywhere, as v1 did ("( REPEAT INTRO ) [G]")
      /\b(INTRO|INSTRU(C|MENT(AL)?)?)\b/.test(part) ||
      part.includes("|")
    )
  }

  public parser(sheet: string[]): string[] {
    let newSheet = [] as string[]

    sheet.forEach((element) => {
      element = this.escapeHtml(element)
      element = this.isNotLyric(element)
        ? this.removeSquareBrackets(element)
        : this.applyChordStyling(element)

      newSheet.push(element)
    })

    return newSheet
  }

  abstract format(sheet: string[]): string[]
}

export default SheetFormatter
