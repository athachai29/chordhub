import songModal from "../../models/songs";

export default defineEventHandler(async (event) => {
  const { query } = getQuery(event);

  const sheet = await songModal.find({
    active: true,
    title: new RegExp(query, "i"),
  });
  return {
    success: true,
    data: sheet,
  };
});
