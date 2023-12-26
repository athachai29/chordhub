# Sheet Formatter

"Formatter" is how each part of a sheet is combined together.

Implement with Strategy Design Pattein.

## Example usage

```js
import { IFormat, IIFormat, ZFormat } from "~/utils/sheet-formatter"

const formatter = (sheet, format) => {
  return format.format(sheet)
}

const sheet = [] // sheet array

const iFormat = new IFormat()
const iiFormat = new IIFormat()
const zFormat = new ZFormat()

const sheetForIFormat = format(sheet, iFormat)
const sheetForIIFormat = format(sheet, iIFormat)
const sheetForZFormat = format(sheet, zFormat)
```
