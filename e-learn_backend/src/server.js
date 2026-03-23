import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import authRoutes from "./routes/authRoutes.js"; 
import errorHandler from "./middlewares/errorMiddleware.js";
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Parse incoming JSON bodies
app.use(express.json()); 
//before the data is passed 
// Mount auth routes
app.use("/api/auth", authRoutes);

// Global error handler — MUST be last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
