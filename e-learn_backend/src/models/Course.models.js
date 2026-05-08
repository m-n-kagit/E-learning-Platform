import mongoose from "mongoose";
import "./Lesson.models.js";
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

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
    overview_video:{
      type: String, //video URL
      default: ""
    },
    overview_videoPublicId: {
      type: String,
      default: ""
    },

    thumbnailPublicId: {
      type: String,
      default: ""
    },

    price: { //in rupees
      type: Number,
      default: 0
    },

    category: { //category of the course, e.g., "Programming", "Design", "Marketing", etc.
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

const Course = mongoose.model("Course", courseSchema);
export default Course;
