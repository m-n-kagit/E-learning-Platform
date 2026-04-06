import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; //cookies acces and can be set
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/EmailRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import rateLimiter from "./utils/rate-limiter.js";

dotenv.config();
//the config file is loaded before the app is created so that the environment variables are available when the app is initialized. 

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials : true //allow cookies auth 
}))


app.use("/api/auth",rateLimiter.auth_limiter) // Apply rate limiting to auth routes
app.use(express.json({limit : "16kb"})) // for resistng website crash beacuse of overloading
app.use(express.urlencoded({extended: true, limit: "16kb"})) //for parsing url encoded data from html forms 
// and also for resisting website crash beacuse of overloading
app.use(express.static("public"))//
//for serving static files like images, css, js files etc 
// from the public folder
//why it is required ? ans. if we want to serve any 
// static files like images, css, js files etc from 
// the public folder then we need to use this middleware otherwise 
// we will get 404 error when we try to access those files
//  from the frontend.
app.use(cookieParser())
//before the data is passed 
// Mount auth routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes); 


// Global error handler — MUST be last middleware
app.use(errorHandler);

export { app };




