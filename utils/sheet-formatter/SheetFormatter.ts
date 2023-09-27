class SheetFormatter {
  #notLyricKeywords = ["INTRO", "INSTRUC", "INSTRU"]

  format(sheet: string[]): string[] {
    throw new Error("Subclasses must implement the format method.")
  }

  isNotLyric(part: string) {
    return this.#notLyricKeywords.some((keyword) => part.includes(keyword))
  }

  #removeSquareBrackets(part: string) {
    return part.replaceAll("[\\[\\]]", "")
  }

  #applyChordStyling(part: string) {
    return part
      .replaceAll("][", "&nbsp;&nbsp;&nbsp;&nbsp;")
      .replaceAll("[", "<span class='chord'><span class='inner'>")
      .replaceAll("]", "</span></span>")
  }

  parser(sheet: string[]): string[] {
    let newSheet = [] as string[]

    sheet.forEach((element) => {
      element = this.isNotLyric(element)
        ? this.#removeSquareBrackets(element)
        : this.#applyChordStyling(element)

      newSheet.push(element)
    })

    return newSheet
  }
}

export default SheetFormatter
