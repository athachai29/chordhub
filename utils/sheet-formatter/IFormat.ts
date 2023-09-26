import SheetFormatter from "./SheetFormatter"

class IFormat extends SheetFormatter {
  format(sheet: string[]): string[] {
    let newSheet = [] as string[]

    sheet.forEach((element) => {
      if (
        element.includes("INTRO") ||
        element.includes("INSTRUC") ||
        element.includes("INSTRU")
      ) {
        element = element.replaceAll("[", "").replaceAll("]", "")
      } else {
        element = element
          .replaceAll("][", "&nbsp;&nbsp;&nbsp;&nbsp;")
          .replaceAll("[", "<span class='chord'><span class='inner'>")
          .replaceAll("]", "</span></span>")
      }
      newSheet.push(element)
    })

    return newSheet
  }
}

export default IFormat
