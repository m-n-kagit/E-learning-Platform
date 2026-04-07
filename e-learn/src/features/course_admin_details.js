import { createSlice, nanoid } from "@reduxjs/toolkit";

const emptyC_Admin = {
  _id: "",
    name: "",
    email: "",
    coursesManaged: [],
    profilePicture: "",
    bio: "",
    location: "",
    createdAt: null,
    updatedAt: null,
};

const initialState= {
    c_admin : emptyC_Admin 
}

const courseAdminDetailsSlice = createSlice({
    name: "courseAdminDetails",
    initialState,   
    reducers: {
        setCourseAdmin(state, action) {
            state.c_admin = {
                ...emptyC_Admin,//spreding the emptyC_Admin object to ensure all fields are present
                ...action.payload
            }
        },
        updateCourseAdmin(state, action) {
            const updates = action.payload || {};
            Object.entries(updates).forEach(([key, incomingValue]) => {
        if (incomingValue === undefined || !(key in state.c_admin)) return;
        if (!isEqualValue(state.c_admin[key], incomingValue)) {
          state.c_admin[key] = incomingValue;
        }
      })
        },
        clearCourseAdmin(state) {
            state.c_admin = emptyC_Admin;
        }

    }
})

export const { setCourseAdmin, updateCourseAdmin, clearCourseAdmin } = courseAdminDetailsSlice.actions;
export default courseAdminDetailsSlice.reducer;