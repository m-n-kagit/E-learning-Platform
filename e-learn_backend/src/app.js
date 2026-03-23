import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser" //cookies acces and can be set 
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true //allow cookies auth 
}))



app.use(express.json({limit : "16kb"})) // for resistng website crash beacuse of overloading
app.use(express.urlencoded({extended: true, limit: "16kb"})) //for parsing url encoded data from html forms 
// and also for resisting website crash beacuse of overloading
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
app.use("/api/v1/user/",userRouter) // not directly using app.get beacuase we want to keep our code organize
// d and maintainable by separating routes into different files
//to get this we are getting into the middleware
// stack of express and using the userRouter for handling all routes starting with /user
// and controll is passed to userRouter for handling the specific routes like /register , /login etc which are defined in user.routes.js file

export { app };




