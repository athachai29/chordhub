import songModel from "../../models/songs";

export default defineEventHandler(async () => {
  const sheets = await songModel.find({});
  return {
    success: true,
    total: sheets.length,
    data: sheets,
  };
});
