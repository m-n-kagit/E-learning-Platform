import {configureStore} from '@reduxjs/toolkit'
import activeCourses from '../features/activeCoursesSlice'
import studentDetails from '../features/student_detailsSlice'
import courseAdminDetails from '../features/course_admin_details'
import lessonDetail from '../features/lesson_detailSlice'
//storing the data in the store and providing the data to the components that need it.
const store = configureStore({
    reducer : {
        activeCourses,
        studentDetails,
        courseAdminDetails,
        lessonDetail
    }
});

export default store;

