import songModel from "../../models/songs";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  const song = await songModel.findById(id).populate("_artist");
  return {
    success: true,
    data: song,
  };
});
