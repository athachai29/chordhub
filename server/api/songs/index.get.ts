import songModal from "../../models/songs";

export default defineEventHandler(async () => {
  const sheets = await songModal.find({});
  return {
    success: true,
    total: sheets.length,
    data: sheets,
  };
});
