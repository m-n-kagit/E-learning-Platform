import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    score: {
      type: Number,
      required: true
    },

    totalMarks: {
      type: Number,
      required: true
    },

    percentage: {
      type: Number
    },

    passed: {
      type: Boolean,
      default: false
    },

    attemptNumber: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

// export default mongoose.model("QuizAttempt", quizAttemptSchema);
export default quizAttemptModel = mongoose.model("QuizAttempt", quizAttemptSchema);