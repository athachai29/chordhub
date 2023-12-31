import SheetFormatter from "./SheetFormatter"

class IIFormat extends SheetFormatter {
  public format(sheet: string[]): string[] {
    const parsedSheet = super.parser(sheet)

    let formattedSheet: string[] = []

    parsedSheet.forEach((item, index) => {
      if (index % 2 === 0) {
        formattedSheet.push(item)
      } else {
        formattedSheet[formattedSheet.length - 1] += ` ${item}`
      }
    })

    return formattedSheet
  }
}

export default IIFormat
