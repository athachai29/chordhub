class SheetFormatter {
  format(sheet: string[]): string[] {
    throw new Error("Subclasses must implement the format method.")
  }
}

export default SheetFormatter
