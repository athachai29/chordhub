import mongoose from "mongoose";

const config = useRuntimeConfig();

export default async () => {
  try {
    await mongoose.connect(config.mongoUrl);
  } catch (err) {
    console.error("Database connection failed");
  }
};
