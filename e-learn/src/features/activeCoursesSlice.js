import { createSlice, nanoid } from "@reduxjs/toolkit";

const allowedLevels = ["beginner", "intermediate", "advanced"];

const computeAverageRating = (ratings = []) => {
  if (!ratings.length) return 0;
  const total = ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  return Number((total / ratings.length).toFixed(2));//tofixed to 2 decimal places
};

const normalizeCourse = (course = {}) => {
  const ratings = Array.isArray(course.ratings) ? course.ratings : [];
  const level = allowedLevels.includes(course.level) ? course.level : "beginner";

  return {
    _id: course._id || nanoid(),
    title: String(course.title || "").trim(),
    description: String(course.description || "").trim(),
    instructor: course.instructor || null,
    thumbnail: String(course.thumbnail || ""),
    price: Number(course.price || 0),
    category: String(course.category || "").trim(),
    level,
    lessons: Array.isArray(course.lessons) ? course.lessons : [],
    enrolledStudents: Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [],
    ratings,
    
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
      state.courses = list.map(normalizeCourse);
    },

    selectCourse(state, action) {
      state.selectedCourseId = action.payload || null;
    },

    clearSelectedCourse(state) {
      state.selectedCourseId = null;
    },

    addCourse(state, action) {
      state.courses.push(normalizeCourse(action.payload));
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
      if (!course.enrolledStudents.includes(studentId)) {
        course.enrolledStudents.push(studentId);
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
