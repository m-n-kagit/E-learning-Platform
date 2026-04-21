import { createSlice, nanoid } from "@reduxjs/toolkit";

const allowedLevels = ["beginner", "intermediate", "advanced"];

const computeAverageRating = (ratings = []) => {
  if (!ratings.length) return 0;
  const total = ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  return Number((total / ratings.length).toFixed(2));//tofixed to 2 decimal places
};

const normalizeInstructor = (instructor) => {
  if (!instructor) return null;
  if (typeof instructor === "string") {
    return {
      _id: "",
      name: instructor,
      email: "",
    };
  }

  return {
    _id: instructor._id || "",
    name: String(instructor.name || instructor.fullName || instructor.email || "").trim(),
    email: String(instructor.email || "").trim(),
  };
};

const normalizeLessons = (lessons = []) => {
  if (!Array.isArray(lessons)) return [];

  return lessons.map((lesson, index) => ({
    _id: lesson?._id || nanoid(),
    title: String(lesson?.title || lesson?.lessonName || `Lesson ${index + 1}`).trim(),
    description: String(lesson?.description || "").trim(),
    videoUrl: String(lesson?.videoUrl || ""),
    duration: Number(lesson?.duration || 0),
    order: Number.isFinite(Number(lesson?.order)) ? Number(lesson.order) : index + 1,
    isPreview: Boolean(lesson?.isPreview),
  }));
};

const normalizeCourse = (course = {}) => {
  const ratings = Array.isArray(course.ratings) ? course.ratings : [];
  const level = allowedLevels.includes(course.level) ? course.level : "beginner";
  const lessons = normalizeLessons(course.lessons);
  const instructor = normalizeInstructor(course.instructor);
  const title = String(course.title || course.name || "").trim();
  const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
  const accentPalette = ["#5468ff", "#f97316", "#3ecf8e", "#0ea5e9", "#ef4444"];
  const paletteIndex = title ? title.length % accentPalette.length : 0;
  const color = course.color || accentPalette[paletteIndex];
  const progress = Number(course.progress || 0);
  const courseId = course._id || course.id || nanoid();

  return {
    _id: courseId,
    id: courseId,
    title,
    name: title,
    description: String(course.description || "").trim(),
    instructor,
    instructorName: instructor?.name || "Course Admin",
    thumbnail: String(course.thumbnail || ""),
    price: Number(course.price || 0),
    category: String(course.category || "").trim(),
    level,
    lessons,
    enrolledStudents,
    ratings,
    color,
    progress,
    completed: Number(course.completed || 0),
    total: Number(course.total || lessons.length || 0),
    hoursSpent: Number(course.hoursSpent || 0),
    studentsCount: Number(course.studentsCount || enrolledStudents.length || 0),
    sampleVideoUrl: course.sampleVideoUrl || lessons.find((lesson) => lesson.videoUrl)?.videoUrl || "",
    averageRating:
      typeof course.averageRating === "number"
        ? course.averageRating
        : computeAverageRating(ratings),
    isPublished: Boolean(course.isPublished),
    createdAt: course.createdAt || null,
    updatedAt: course.updatedAt || null,
  };
};

const initialState = {
  courses: [],
  selectedCourseId: null,
};

const mergeCourseLists = (existingCourses = [], incomingCourses = []) => {
  const courseMap = new Map(existingCourses.map((course) => [String(course._id), course]));

  incomingCourses.forEach((course) => {
    const normalizedCourse = normalizeCourse(course);
    const existingCourse = courseMap.get(String(normalizedCourse._id));

    if (!existingCourse) {
      courseMap.set(String(normalizedCourse._id), normalizedCourse);
      return;
    }

    courseMap.set(String(normalizedCourse._id), normalizeCourse({
      ...existingCourse,
      ...normalizedCourse,
      enrolledStudents:
        normalizedCourse.enrolledStudents.length > 0
          ? normalizedCourse.enrolledStudents
          : existingCourse.enrolledStudents,
      progress: normalizedCourse.progress || existingCourse.progress,
      completed: normalizedCourse.completed || existingCourse.completed,
      hoursSpent: normalizedCourse.hoursSpent || existingCourse.hoursSpent,
    }));
  });

  return Array.from(courseMap.values());
};

const activeCoursesSlice = createSlice({
  name: "activeCourses",
  initialState,
  reducers: {
    setCourses(state, action) {
        //action is the payload that is passed 
        // when dispatching the action, 
        // it contains the data that we want to set in the state. 
        // In this case, we expect action.payload to be an array of course objects.
      const list = Array.isArray(action.payload) ? action.payload : [];
      state.courses = mergeCourseLists(state.courses, list);
    },

    selectCourse(state, action) {
      state.selectedCourseId = action.payload || null;
    },

    clearSelectedCourse(state) {
      state.selectedCourseId = null;
    },

    addCourse(state, action) {
      const normalizedCourse = normalizeCourse(action.payload);
      const existingIndex = state.courses.findIndex((course) => course._id === normalizedCourse._id);
      if (existingIndex === -1) {
        state.courses.push(normalizedCourse);
        return;
      }

      state.courses[existingIndex] = normalizeCourse({
        ...state.courses[existingIndex],
        ...normalizedCourse,
      });
    },

    updateCourse(state, action) {
      const { _id, updates } = action.payload || {};
      const idx = state.courses.findIndex((course) => course._id === _id);
      if (idx === -1) return;
      state.courses[idx] = normalizeCourse({
        ...state.courses[idx],
        ...(updates || {}),
      });
    },

    removeCourse(state, action) {
      const id = action.payload;
      state.courses = state.courses.filter((course) => course._id !== id);
    },

    togglePublish(state, action) {
      const id = action.payload;
      const course = state.courses.find((item) => item._id === id);
      if (!course) return;
      course.isPublished = !course.isPublished;
    },

    addLessonToCourse(state, action) {
      const { courseId, lessonId } = action.payload || {};
      const course = state.courses.find((item) => item._id === courseId);
      if (!course || !lessonId) return;
      if (!course.lessons.includes(lessonId)) {
        course.lessons.push(lessonId);
      }
    },

    enrollStudent(state, action) {
      const { courseId, studentId } = action.payload || {};
      const course = state.courses.find((item) => item._id === courseId);
      if (!course || !studentId) return;
      const alreadyEnrolled = course.enrolledStudents.some(
        (student) => String(student?._id || student) === String(studentId)
      );
      if (!alreadyEnrolled) {
        course.enrolledStudents.push(studentId);
        course.studentsCount = course.enrolledStudents.length;
      }
    },

    addRating(state, action) {
      const { courseId, user, rating, review = "" } = action.payload || {};
      const course = state.courses.find((item) => item._id === courseId);
      if (!course || !user) return;
      const parsedRating = Number(rating);
      if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) return;

      const existing = course.ratings.find((entry) => String(entry.user) === String(user));
      if (existing) {
        existing.rating = parsedRating;
        existing.review = String(review);
      } else {
        course.ratings.push({
          user,
          rating: parsedRating,
          review: String(review),
        });
      }

      course.averageRating = computeAverageRating(course.ratings);
    },
  },
});

export const {
  setCourses,
  selectCourse,
  clearSelectedCourse,
  addCourse,
  updateCourse,
  removeCourse,
  togglePublish,
  addLessonToCourse,
  enrollStudent,
  addRating,
} = activeCoursesSlice.actions;

export default activeCoursesSlice.reducer;
