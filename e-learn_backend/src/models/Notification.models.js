import mongoose from "mongoose";

const noitfy_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String,
        required: true
    },
    isRead: {   
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export default notifyModel = mongoose.model("Notification", noitfy_schema);