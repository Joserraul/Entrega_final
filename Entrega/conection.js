import "dotenv/config";
import { connect } from "mongoose";

export const initMongoDB = async () => {
  try {
    await connect(process.env.MONGO_ATLAS_URL);
    console.log("Connected to MongoDB");
    // await connect(process.env.MONGO_ATLAS_URL);
  } catch (error) {
    throw new Error(`Error connecting to MongoDB: ${error}`);
  }
};

