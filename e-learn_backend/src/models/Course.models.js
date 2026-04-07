import mongoose from "mongoose";
import "Lesson.models.js"; // Ensure Lesson model is registered before referencing it
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    lessons:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    }],

    description: {
      type: String,
      required: true
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    thumbnail: {
      type: String, // image URL
      default: ""
    },

    price: {
      type: Number,
      default: 0
    },

    category: {
      type: String,
      trim: true
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },

    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      }
    ],

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        review: {
          type: String
        }
      }
    ],

    averageRating: {
      type: Number,
      default: 0
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default courseModel = mongoose.model("Course", courseSchema);