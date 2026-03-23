import mongoose from "mongoose";  
const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  }
});

export default enrollmentModel = mongoose.model("Enrollment", enrollmentSchema);
