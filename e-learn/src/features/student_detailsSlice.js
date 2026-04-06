import { createSlice } from "@reduxjs/toolkit";

const emptyStudent = {
  _id: "",
  name: "",
  email: "",
  enrolledCourses: [],
  certificates: [],
  globalRanking: null,
  bio:"",
  courseProgress:{
    course: null,
    progress: null
  },
  initial: "",
    location:"",
  achievements: [],
  profilePicture: "",
  createdAt: null,
  updatedAt: null,
};

const initialState = {
  student: emptyStudent,
};

const isEqualValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const normalizeStudent = (student = {}) => ({
  ...emptyStudent,
  ...(student || {}),
});

const studentDetailsSlice = createSlice({
  name: "studentDetails",
  initialState,
  reducers: {
    setStudent(state, action) {
      state.student = normalizeStudent(action.payload);
    },

    updateStudent(state, action) {
      const updates = action.payload || {};

      Object.entries(updates).forEach(([key, incomingValue]) => {
        if (incomingValue === undefined || !(key in state.student)) return;
        if (!isEqualValue(state.student[key], incomingValue)) {
          state.student[key] = incomingValue;
        }
      });
    },

    clearStudent(state) {
      state.student = emptyStudent;
    },
  },
});

export const { setStudent, updateStudent, clearStudent } = studentDetailsSlice.actions;
export default studentDetailsSlice.reducer;
