import { createSlice, nanoid } from "@reduxjs/toolkit";

const emptyG_Admin = {
  _id: "",
    name: "",
    email: "",
    admins: [],
};

const initialState= {
    c_admin : emptyG_Admin 
}

const globalAdminDetailsSlice = createSlice({
    name: "globalAdminDetails",
    initialState,   
    reducers: {
        setAdmin(state, action) {
            state.c_admin = {
                ...emptyG_Admin,//spreding the emptyG_Admin object to ensure all fields are present
                ...action.payload
            }
        },
        updateAdmin(state, action) {
            const updates = action.payload || {};
            Object.entries(updates).forEach(([key, incomingValue]) => {
        if (incomingValue === undefined || !(key in state.c_admin)) return;
        if (!isEqualValue(state.c_admin[key], incomingValue)) {
          state.c_admin[key] = incomingValue;
        }
      })
        },

    }
})

export const { setCourseAdmin, updateCourseAdmin, clearCourseAdmin } = courseAdminDetailsSlice.actions;
export default courseAdminDetailsSlice.reducer;