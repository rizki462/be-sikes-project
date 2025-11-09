import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL || "";
export const SECRET = process.env.SECRET || "";
export const PORT = process.env.PORT || 3000;