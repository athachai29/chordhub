import mongoose from "mongoose";

const config = useRuntimeConfig();

export default async () => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log("Database connection established.");
  } catch (err) {
    console.error("Database connection failed.", err);
  }
};
