import SheetFormatter from "./SheetFormatter"

class ZFormat extends SheetFormatter {
  public format(sheet: string[]): string[] {
    const newSheet = super.parser(sheet)

    // TODO: Combine some lyric parts to make it wider.

    return newSheet
  }
}

export default ZFormat
