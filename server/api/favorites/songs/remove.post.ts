import userModel from "../../../models/users";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, songId } = body;

  const updatedResponse = await userModel.findByIdAndUpdate(
    userId,
    {
      $pull: { favorites: songId },
    },
    { new: true }
  );
  return {
    success: true,
    data: updatedResponse,
  };
});
