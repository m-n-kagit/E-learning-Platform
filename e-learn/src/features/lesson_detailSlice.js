import { createSlice } from "@reduxjs/toolkit";
const emptyC_Lesson = {
  _id: "",
    course: "",
	videoUrl  :"",
     videoUrl: "",

    videoPublicId: "",

    duration: 0,

    order: 0,

    isPreview: false,

    resources: [
      {
        title: "",
        fileUrl: ""
      }
    ],
    createdAt: null,
    updatedAt: null,
};

const lessonDetailSlice = createSlice({
	name: "lessonDetail",
	initialState: emptyC_Lesson,
	reducers: {
		getLessonName(state, action) {
			state.lessonName = String(action.payload || "").trim();
		},
		clearLessonName(state) {
			state.lessonName = "";
		},
	},
});

export const { getLessonName, clearLessonName } = lessonDetailSlice.actions;
export default lessonDetailSlice.reducer;
