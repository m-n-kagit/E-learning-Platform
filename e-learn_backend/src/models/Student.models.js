import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({

    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    initial : {
        type: String,
        trim: true,
        default: ""
    },
    certificates: [{
        type:String,
        trim: true,
    }],
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
        
    }],
    globalRanking: {
        type: Number,
        default: null
    },
    courseProgress: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        progress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Progress",
            default: null
        } 
    }],
    notification:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification"
    }],
    bio : {
        type: String,
        trim: true,
        default: ""
    },
    location : {
        type: String,
        trim: true, 
}, 
joinedDate:{
    type: Date,
    default: Date.now
},
    profilePicture: {
        type: String, // url of the profile picture
        trim: true,     }
    
})

export default studentModel = mongoose.model("Student", studentSchema);