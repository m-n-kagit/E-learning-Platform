const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

  lessonProgress: [
    {
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      },

      bestScore: Number,
      isCompleted: {
        type: Boolean,
        default: false
      }
    }
  ],

  overallProgress: {
    type: Number,
    default: 0
  }
});