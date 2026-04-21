import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    videoUrl: {
      type: String,
      required: true
    },

    videoPublicId: { // this is needed 
      type: String,
      default: ""
    },

    duration: {
      type: Number, // in seconds
      default: 0
    },

    order: {// position of the lesson within the course
      type: Number,
      required: true
    },

    isPreview: {
      type: Boolean,
      default: false
    },

    resources: [
      {
        title: String,
        fileUrl: String
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Lesson", lessonSchema);
