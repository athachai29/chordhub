import sheetModal from "../../models/sheets";

export default defineEventHandler(async (event) => {
  const sheet = await sheetModal.findOne({});
  return {
    success: true,
    data: sheet,
  };
});
