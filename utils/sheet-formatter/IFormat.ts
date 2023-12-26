import SheetFormatter from "./SheetFormatter"

class IFormat extends SheetFormatter {
  public format(sheet: string[]): string[] {
    return super.parser(sheet)
  }
}

export default IFormat
