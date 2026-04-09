import Progress from "./models/Progress.js";
const progress = await Progress.findOne({ user, course });

const lessonData = progress.lessonProgress.find(
  l => l.lesson.toString() === lessonId
);

if (!lessonData) {
  // first attempt
  progress.lessonProgress.push({
    lesson: lessonId,
    bestScore: percentage,
    isCompleted: percentage >= 40
  });
} else {
  // update best score
  if (percentage > lessonData.bestScore) {
    lessonData.bestScore = percentage;
  }

  if (percentage >= 40) {
    lessonData.isCompleted = true;
  }
}

await progress.save();