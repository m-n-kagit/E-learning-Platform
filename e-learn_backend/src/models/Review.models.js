const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });