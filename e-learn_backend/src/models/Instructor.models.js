import mongoose from "mongoose";
const instructorSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bio : {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String, // url of the profile picture
        trim: true,
    },
    location : {
        type: String,
        trim: true, 
    },
    courses : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }]
},{timestamps: true})

const Instructor = mongoose.model("Instructor", instructorSchema);
export default Instructor;
