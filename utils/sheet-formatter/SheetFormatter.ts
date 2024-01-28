abstract class SheetFormatter {
  private notLyricKeywords = ["INTRO", "INSTRUC", "INSTRU", "|"]

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
    return this.notLyricKeywords.some((keyword) => part.includes(keyword))
  }

  public parser(sheet: string[]): string[] {
    let newSheet = [] as string[]

    sheet.forEach((element) => {
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
