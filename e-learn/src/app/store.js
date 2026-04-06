import {configureStore} from '@reduxjs/toolkit'
import activeCourses from '../features/activeCoursesSlice'
import studentDetails from '../features/student_detailsSlice'
//storing the data in the store and providing the data to the components that need it.
const store = configureStore({
    reducer : {
        activeCourses,
        studentDetails
    }
});

export default store;
