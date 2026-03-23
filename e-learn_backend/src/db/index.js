import mongoose from "mongoose"
//alternative of this 
// import dotenv from "dotenv";
// dotenv.config();
DB_NAME = "e-learn_db";
const connectDB = async()=> {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB host : ${mongoose.connection.host}`);
        
    }catch (error){
        console.log("MongoDB ERROR",error);
        process.exit(1);       
    }
}

export default connectDB;