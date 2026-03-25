import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import authRoutes from "./routes/authRoutes.js"; 
import errorHandler from "./middlewares/errorMiddleware.js";
import {app} from "./app.js";
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1); // Exit with failure
});

// Parse incoming JSON bodies




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
