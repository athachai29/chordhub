import SheetFormatter from "./SheetFormatter"

class IFormat extends SheetFormatter {
  format(sheet: string[]): string[] {
    const newSheet = super.parser(sheet)

    return newSheet
  }
}

export default IFormat
