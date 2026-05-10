import { createSlice } from "@reduxjs/toolkit";

const emptyLesson = {
	lessonName: "",
};

const lessonDetailSlice = createSlice({
	name: "lessonDetail",
	initialState: emptyLesson,
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
